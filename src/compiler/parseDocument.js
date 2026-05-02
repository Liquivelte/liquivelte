export function parseDocument(tokens, options) {
    // Post-process tokens to identify component tags if componentNames are provided
    const componentNames = options?.componentNames || [];
    let processedTokens = tokens;
    if (componentNames.length > 0) {
        processedTokens = tokens.map(token => {
            if (token.type === 'Html' && componentNames.length > 0) {
                const content = token.content || '';
                // Check if this HTML contains a component tag
                for (const componentName of componentNames) {
                    const componentMatch = content.match(new RegExp(`<${componentName}[^>]*>`));
                    if (componentMatch) {
                        const full = componentMatch[0];
                        const selfClosing = full.includes('/>');
                        // Parse props
                        const props = {};
                        const attrsMatch = full.match(new RegExp(`<${componentName}(\\s+[^>]*?)`));
                        if (attrsMatch) {
                            const attrMatches = attrsMatch[1].matchAll(/(\w+)=["']([^"']*)["']/g);
                            for (const match of attrMatches) {
                                props[match[1]] = match[2];
                            }
                        }
                        return {
                            type: 'ComponentTag',
                            name: componentName,
                            selfClosing,
                            props
                        };
                    }
                }
            }
            return token;
        });
    }
    return {
        type: 'Document',
        tokens: processedTokens,
        componentNames
    };
}
//# sourceMappingURL=parseDocument.js.map