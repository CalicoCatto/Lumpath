import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useSettings } from '../hooks/useSettings';
import { PROVIDERS, getModelsByProvider } from '../constants/models';
import { testConnection } from '../services/llm';
import type { ProviderID } from '../types';

export default function SettingsPage() {
  const { settings, save } = useSettings();
  const [provider, setProvider] = useState<ProviderID>(settings?.provider ?? 'moonshot');
  const [modelId, setModelId] = useState(settings?.modelId ?? '');
  const [apiKey, setApiKey] = useState(settings?.apiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  const [saved, setSaved] = useState(false);

  const models = getModelsByProvider(provider);

  // Auto-select first model when switching provider
  useEffect(() => {
    const providerModels = getModelsByProvider(provider);
    if (providerModels.length > 0 && !providerModels.find(m => m.id === modelId)) {
      setModelId(providerModels[0].id);
    }
  }, [provider, modelId]);

  const handleTest = async () => {
    if (!apiKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection({ provider, modelId, apiKey });
      setTestResult(ok ? 'success' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    save({ provider, modelId, apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canSave = provider && modelId && apiKey;

  const providerLinks: Record<ProviderID, string> = {
    moonshot: 'https://platform.moonshot.cn',
    siliconflow: 'https://cloud.siliconflow.cn',
  };

  return (
    <PageContainer title="设置">
      {/* Provider Selection */}
      <section className="mb-6">
        <label className="text-sm font-medium text-stone-600 mb-2 block">模型提供商</label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.values(PROVIDERS)).map(p => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                provider === p.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="font-semibold text-sm text-stone-800">{p.name}</div>
              <div className="text-xs text-stone-400 mt-1 truncate">{p.baseUrl}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Model Selection */}
      <section className="mb-6">
        <label className="text-sm font-medium text-stone-600 mb-2 block">选择模型</label>
        <div className="space-y-2">
          {models.map(m => (
            <button
              key={m.id}
              onClick={() => setModelId(m.id)}
              className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                modelId === m.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-stone-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-stone-800">{m.name}</span>
                {m.isReasoningModel && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    推理
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                输入 ${m.inputPrice}/M · 输出 ${m.outputPrice}/M tokens
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* API Key */}
      <section className="mb-6">
        <label className="text-sm font-medium text-stone-600 mb-2 block">API 密钥</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
            placeholder="sk-..."
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-primary-500 transition-colors"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <a
          href={providerLinks[provider]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary-600 mt-2"
        >
          获取 API Key <ExternalLink size={12} />
        </a>
      </section>

      {/* Test Connection */}
      <section className="mb-6">
        <button
          onClick={handleTest}
          disabled={!apiKey || testing}
          className="w-full flex items-center justify-center gap-2 bg-white border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-600 disabled:opacity-50 transition-colors active:bg-stone-50"
        >
          {testing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 测试中...
            </>
          ) : testResult === 'success' ? (
            <>
              <CheckCircle size={16} className="text-green-500" /> 连接成功
            </>
          ) : testResult === 'fail' ? (
            <>
              <XCircle size={16} className="text-red-500" /> 连接失败，请检查密钥
            </>
          ) : (
            '测试连接'
          )}
        </button>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full bg-gradient-to-r from-primary-500 to-rose-500 text-white font-semibold rounded-xl py-3.5 text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {saved ? '已保存 ✓' : '保存设置'}
      </button>
    </PageContainer>
  );
}
