var Generic = require('../constants/Generic');

var Enum = Generic.Enum;
var State = Generic.State;    

function GenericReducer(state = State, action) {
    switch(action.type) {
        case Enum.SelectionModeChanged:
            return Object.assign({}, state, { mapEnabled: action.payload });
        break;

        case Enum.DateFromChanged:
            return Object.assign({}, state, { dateFrom: action.payload });
        break;

        case Enum.DateToChanged:
            return Object.assign({}, state, { dateTo: action.payload });
        break;

        case Enum.LatFromChanged:
            return Object.assign({}, state, { latFrom: action.payload });
        break;

        case Enum.LatToChanged:
            return Object.assign({}, state, { latTo: action.payload });
        break;

        case Enum.LngFromChanged:
            return Object.assign({}, state, { lngFrom: action.payload });
        break;

        case Enum.LngToChanged:
            return Object.assign({}, state, { lngTo: action.payload });
        break;

        case Enum.AltFromChanged:
            return Object.assign({}, state, { altFrom: action.payload });
        break;

        case Enum.AltToChanged:
            return Object.assign({}, state, { altTo: action.payload });
        break;

        default:
            return state;
        break;
    }
}

module.exports = GenericReducer;
