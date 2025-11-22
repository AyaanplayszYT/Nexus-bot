const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const fetchFn = typeof fetch === 'function' ? fetch : (...args) => import('node-fetch').then(mod => mod.default(...args));

async function chatCompletion(messages) {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not set in the environment.');
    }

    const sanitizedMessages = messages
        .filter(message => message && message.role && message.content)
        .map(message => ({
            role: message.role,
            name: message.name,
            content: String(message.content),
        }));

    if (!sanitizedMessages.length) {
        throw new Error('OpenRouter API error: no valid messages provided.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const requestBody = {
        model: 'x-ai/grok-4.1-fast:free',
        messages: sanitizedMessages,
        max_tokens: 1024,
    };

    let response;
    try {
        response = await fetchFn(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://github.com/AyaanplayszYT/Nexus-bot',
                'X-Title': 'Nexus Discord Bot',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API Response Error:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`OpenRouter API error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    return data.choices?.[0]?.message?.content || 'No response from AI.';
}

module.exports = {
    chatCompletion,
};
