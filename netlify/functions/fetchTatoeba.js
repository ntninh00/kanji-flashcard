const axios = require('axios');

exports.handler = async (event) => {
    const kanji = event.queryStringParameters.kanji;
    const url = `https://tatoeba.org/en/api_v0/search?from=jpn&orphans=no&query=${encodeURIComponent(`"${kanji}"`)}&sort=random&to=eng&trans_filter=limit&unapproved=no&word_count_min=1&rand_seed=XwFw`;

    try {
        const response = await axios.get(url);
        const results = response.data.results;

        // Filter sentences that strictly contain the target word
        const strictMatches = results.filter(result => {
            return result.text.includes(kanji); // Only include sentences that contain the exact word
        });

        // Format the data to include Japanese sentence and English translation (if available)
        const sentences = strictMatches.slice(0, 3).map(result => ({
            japanese: result.text,
            english: result.translations && result.translations[0] && result.translations[0][0] 
            ? result.translations[0][0].text 
            : null, // Safely access nested translation text
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(sentences),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch sentences' }),
        };
    }
};