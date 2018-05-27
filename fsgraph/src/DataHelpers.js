
/**
 * 
 * @param {Object.<string, *>} container 
 * @param {string} key 
 * @param {string} type 
 */
export function getValue(container, key, type) {
    let val = container[key];
    let valType = typeof val;
    if (valType !== type) {
        throw new Error(`Type mismatch: got '${valType}' but expected '${type}'!`);
    }

    return val;
}

/**
 * 
 * @param {Object.<string, *>} container 
 * @param {string} key 
 * @param {string} type 
 * @param {*} defaultValue 
 */
export function getValueDef(container, key, type, defaultValue) {
    let val = container[key];
    let valType = typeof val;

    return ((val) && (valType === type)) ? val : defaultValue;
}