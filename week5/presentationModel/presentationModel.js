
import { Observable } from "../observable/observable.js";
import { id }         from "../church/church.js";

export { Attribute,
         VALID, VALUE, EDITABLE, LABEL, DIRTY }

const VALUE    = "value";
const VALID    = "valid";
const EDITABLE = "editable";
const LABEL    = "label";
const DIRTY    = "dirty";

const Attribute = value => {

    const observables = {};
    let   baseValue = value;

    const hasObs = name => observables.hasOwnProperty(name);

    const getObs = (name, initValue = null) =>
        hasObs(name)
            ? observables[name]
            : observables[name] = Observable(initValue);

    getObs(VALUE, value); // initialize the value at least
    getObs(DIRTY, false);

    getObs(VALUE).onChange(val => getObs(DIRTY).setValue(val !== baseValue));

    const reset  = () => getObs(VALUE).setValue(baseValue);
    const rebase = () => {
        baseValue = getObs(VALUE).getValue();
        getObs(DIRTY).setValue(false);
    };

    let   convert           = id ;
    const setConverter      = converter => {
        convert = converter;
        setConvertedValue(value);
    };
    const setConvertedValue = val => getObs(VALUE).setValue(convert(val));

    // todo: this might set many validators without discharging old ones
    const setValidator = validate => getObs(VALUE).onChange( val => getObs(VALID).setValue(validate(val)));

    return { getObs, hasObs, setValidator, setConverter, setConvertedValue, reset, rebase }
};
