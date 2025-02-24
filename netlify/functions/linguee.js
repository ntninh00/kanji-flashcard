const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async (event) => {
    const kanji = event.queryStringParameters.kanji;
    const url = `https://www.linguee.com/english-japanese/search?source=auto&query=${encodeURIComponent(kanji)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Mimic a browser
            },
        });
        const html = response.data;

        // Load HTML with Cheerio
        const $ = cheerio.load(html);
        let sentences = [];

        // Target #result_container.webservice for example sentences
        const resultContainer = $('#result_container.webservice');
        if (resultContainer.length) {
            console.log('Found #result_container.webservice');
            resultContainer.find('tbody.examples tr').each((i, element) => {
                const japaneseTd = $(element).find('td.sentence.left');
                const englishTd = $(element).find('td.sentence.right2');
                
                // Extract only the sentence text from .wrap, excluding URLs and metadata
                const japaneseWrap = japaneseTd.find('.wrap');
                const englishWrap = englishTd.find('.wrap');
                
                const japanese = japaneseWrap.clone()    // Clone the element
                    .find('.source_url, .source_url_spacer') // Remove URL elements
                    .remove()
                    .end() // Return to the cloned element
                    .text().trim() || '';
                let english = englishWrap.clone()    // Clone the element
                    .find('.source_url, .source_url_spacer') // Remove URL elements
                    .remove()
                    .end() // Return to the cloned element
                    .html().trim() || null; // Use .html() to capture HTML for parsing placeholders

                // Clean up English translation: remove all placeholder and shortened text indicators
                if (english) {
                    // Convert HTML to text and clean placeholders
                    english = $('<div>').html(english).text() // Convert HTML to plain text
                        .replace(/\[…\]/g, '') // Remove literal "[...]"
                        .replace(/<span class="placeholder_begin2">\[…\]<\/span>/g, '') // Remove placeholder_begin2
                        .replace(/<span class="placeholder_end2">\[…\]<\/span>/g, '') // Remove placeholder_end2
                        .replace(/<div class="shortened_begin2">.*?<\/div>/g, '') // Remove shortened_begin2 content
                        .replace(/<div class="shortened_end2">.*?<\/div>/g, '') // Remove shortened_end2 content
                        .replace(/<span class="warnSign[^>]*>.*?<\/span>/g, '') // Remove warning signs and tooltips
                        .replace(/<span class="warnSign2[^>]*>.*?<\/span>/g, '') // Remove additional warning signs
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();
                }

                

                console.log('Found sentence:', { japanese, english }); // Debug log

                // Check if the Japanese sentence contains the kanji (case-insensitive)
                if (japanese && japanese.includes(kanji)) {
                    sentences.push({ japanese, english, length: japanese.length });
                }
            });
        } else {
            console.log('Couldn’t find #result_container.webservice');
            return {
                statusCode: 200,
                body: JSON.stringify([]),
            };
        }

        // Sort by length (shortest first) and take the top 3
        sentences.sort((a, b) => a.length - b.length);
        const shortestSentences = sentences.slice(0, 3).map(s => ({
            japanese: s.japanese,
            english: s.english,
        }));

        console.log('Processed Linguee sentences:', shortestSentences);

        return {
            statusCode: 200,
            body: JSON.stringify(shortestSentences),
        };
    } catch (error) {
        console.error('Error fetching Linguee data:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch sentences: ' + error.message }),
        };
    }
};