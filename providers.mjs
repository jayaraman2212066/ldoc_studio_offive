// Agents Office — Free & Local AI Providers
// Supports:
// 1. Google Gemini (Gemini 2.5 Flash, Gemini 1.5 Pro with GEMINI_API_KEY)
// 2. Local Ollama (OLLAMA_ENDPOINT, e.g. mistral, deepseek-r1, qwen2.5, llama3)
// 3. Intelligent LDoc Studio Local Fallback (runs offline with zero cost)

export class ProviderManager {
  constructor(config = {}) {
    this.config = config;
    this.ollamaEndpoint = process.env.OLLAMA_ENDPOINT || config.ollama?.endpoint || 'http://127.0.0.1:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || config.ollama?.model || 'mistral';
    this.geminiApiKey = process.env.GEMINI_API_KEY || config.gemini?.apiKey || '';
    this.geminiModel = process.env.GEMINI_MODEL || config.gemini?.model || 'gemini-flash-latest';
    this.activeProvider = 'detecting';
  }

  async detect() {
    // 1. If Gemini API key is provided
    if (this.geminiApiKey) {
      this.activeProvider = 'gemini';
      return { provider: 'gemini', model: this.geminiModel, free: true };
    }

    // 2. If Anthropic API key is explicitly provided
    if (process.env.ANTHROPIC_API_KEY) {
      this.activeProvider = 'anthropic-sdk';
      return { provider: 'anthropic-sdk' };
    }

    // 3. Check if local Ollama service is up
    try {
      const res = await fetch(`${this.ollamaEndpoint}/api/tags`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map(m => m.name.split(':')[0]);
        this.availableOllamaModels = models;
        this.activeProvider = 'ollama';
        return { provider: 'ollama', model: this.ollamaModel, endpoint: this.ollamaEndpoint, models, free: true };
      }
    } catch {}

    // 4. Default to Gemini provider mode with offline local safety fallback
    this.activeProvider = 'gemini';
    return { provider: 'gemini', model: this.geminiModel, free: true, needsKey: !this.geminiApiKey };
  }

  mapModel(model) {
    const m = String(model || '').toLowerCase();
    if (m.includes('opus') || m.includes('pro')) return 'gemini-3.6-flash';
    if (m.includes('sonnet') || m.includes('fable') || m.includes('flash')) return 'gemini-flash-latest';
    return model || this.geminiModel;
  }

  async generate(system, user, { maxTokens = 4000, model = null, timeout = 120000 } = {}) {
    const key = process.env.GEMINI_API_KEY || this.geminiApiKey;
    if (key) {
      this.geminiApiKey = key;
      const candidates = [this.mapModel(model), 'gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash'];
      for (const m of Array.from(new Set(candidates))) {
        try {
          return await this.generateGemini(system, user, { maxTokens, model: m, timeout });
        } catch (err) {
          console.warn(`Gemini model ${m} failed (${err.message}), trying next...`);
        }
      }
    }

    if (this.activeProvider === 'ollama') {
      try {
        return await this.generateOllama(system, user, { maxTokens, model: model || this.ollamaModel, timeout });
      } catch (err) {}
    }

    // Robust offline generator for LDoc Studio
    return this.generateLDocStudioLocal(system, user);
  }

  async generateGemini(system, user, { maxTokens, model, timeout }) {
    const targetModel = this.mapModel(model);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${this.geminiApiKey}`;
    
    const body = {
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens }
    };
    if (system) {
      body.system_instruction = { parts: [{ text: system }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout)
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = {
      input_tokens: data.usageMetadata?.promptTokenCount || 0,
      output_tokens: data.usageMetadata?.candidatesTokenCount || 0
    };

    return {
      text: text.trim(),
      tools: [],
      usage,
      modelId: targetModel,
      provider: 'gemini'
    };
  }

  async generateOllama(system, user, { maxTokens, model, timeout }) {
    const targetModel = model || this.ollamaModel;
    const res = await fetch(`${this.ollamaEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        stream: false,
        options: { num_predict: maxTokens }
      }),
      signal: AbortSignal.timeout(timeout)
    });

    if (!res.ok) throw new Error(`Ollama status ${res.status}`);
    const data = await res.json();
    return {
      text: (data.message?.content || '').trim(),
      tools: [],
      usage: { input_tokens: data.prompt_eval_count || 0, output_tokens: data.eval_count || 0 },
      modelId: targetModel,
      provider: 'ollama'
    };
  }

  generateLDocStudioLocal(system, user) {
    // 1. If routing JSON is requested
    if (user.includes('Return: {"agent":') || system.includes('Return ONLY a JSON object')) {
      let chosenAgent = 'elead';
      const low = user.toLowerCase();
      if (low.includes('sale') || low.includes('proposal') || low.includes('quote') || low.includes('license') || low.includes('offline') || low.includes('price')) {
        chosenAgent = low.includes('proposal') ? 'piper' : 'lexi';
      } else if (low.includes('market') || low.includes('post') || low.includes('tweet') || low.includes('reel') || low.includes('newsletter') || low.includes('launch')) {
        chosenAgent = low.includes('newsletter') ? 'newt' : 'mlead';
      } else if (low.includes('feedback') || low.includes('qa') || low.includes('bug') || low.includes('test') || low.includes('release')) {
        chosenAgent = 'qa';
      } else if (low.includes('email') || low.includes('support') || low.includes('inbox') || low.includes('user')) {
        chosenAgent = 'cmail';
      } else if (low.includes('invoice') || low.includes('cash') || low.includes('bill')) {
        chosenAgent = 'invo';
      } else if (low.includes('legal') || low.includes('eula') || low.includes('terms') || low.includes('contract')) {
        chosenAgent = 'legal';
      }

      const titleMatch = user.match(/Owner's request:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1].slice(0, 70) : 'LDoc Studio Priority Task';

      return {
        text: JSON.stringify({
          agent: chosenAgent,
          title,
          plan: ['Analyze LDoc Studio requirements', 'Draft executive deliverable', 'Cross-reference Brain knowledge base'],
          eta_minutes: 10,
          why: 'Matched for LDoc Studio founder operations',
          needs_ok: low.includes('send') || low.includes('pay') || low.includes('post')
        }),
        tools: [],
        usage: { input_tokens: 60, output_tokens: 60 },
        modelId: 'ldoc-local-engine',
        provider: 'local'
      };
    }

    // 2. Conversational or deliverable generation for LDoc Studio
    const titleMatch = user.match(/Task:\s*([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : 'LDoc Studio Deliverable';

    return {
      text: `# ${title}\n\n` +
            `**LDoc Studio Operational Briefing**\n\n` +
            `- **Objective**: Scaling LDoc Studio from freemium market adoption to high-value paid offline studio licenses.\n` +
            `- **Strategy**: Target developer pain points with documentation, distribute community version freely, and introduce offline studio licensing for teams requiring local air-gapped security.\n` +
            `- **Action Taken**: Formulated strategy and deliverables aligned with founder priorities.\n\n` +
            `*(Generated via LDoc Studio Local Engine. To enable live neural intelligence, add your free Google AI Studio key: \`export GEMINI_API_KEY="your_key"\`)*`,
      tools: [],
      usage: { input_tokens: 30, output_tokens: 120 },
      modelId: 'ldoc-local-engine',
      provider: 'local'
    };
  }
}
