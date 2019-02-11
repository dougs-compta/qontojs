export const transformFromCamelCaseToSnakeCase: (text: string) => string = function(text: string): string {
    const upperChars = text.match(/([A-Z])/g);
    if (!upperChars) return text;

    let str = text;
    for (let i = 0, n = upperChars.length; i < n; i++) {
        text = str.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase());
    }

    if (str.slice(0, 1) === '_') {
        str = str.slice(1);
    }

    return str;
};

export const buildQueryString: (params: object) => string = (params: object) => {
    const queryParameters = [];
    for (const key in params) {
        if (params[key] && Array.isArray(params[key])) {
            queryParameters.push(`${key}=${params[key].map(v => v).join(',')}`);
        } else if (params[key] && typeof params[key] === 'object') {
            queryParameters.push(
                ...Object.keys(params[key]).map(subKey => {
                    return `${key}[${subKey}]=${params[key][subKey]}`;
                })
            );
        } else {
            queryParameters.push(`${key}=${params[key]}`);
        }
    }
    return queryParameters.join('&');
};
