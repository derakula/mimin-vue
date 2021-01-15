/**
 * Processing fields and spaces
 * @param editField field data description
 */
export const convertFieldWidget = (editField) => {
  const widget = editField.widget;
  let realWidget = convertWidget(widget);
  //Process verification rules
  realWidget.rules = validatorAdapter(editField || []);
  return realWidget;
};

/**
 * Processing controls
 * @param widget Description of control data returned in the background
 */
export const convertWidget = (widget) => {
  let widgetProcessorElement = widgetProcessor[widget.widgetName];
  let realWidget;
  //Find the processor for control processing, otherwise directly use the component properties returned by the background
  if (widgetProcessorElement) {
    realWidget = widgetProcessorElement(widget);
  } else {
    realWidget = { ...widget };
  }
  return realWidget;
};

const widgetProcessor = {
  //Select control
  "v-select": (widget) => {
    return {
      ...widget,
      key: widget.key,
      label: widget.text,
      items: widget.model,
      "x-samll": true,
      "item-text": "label",
      "item-value": "value",
      "small-chips": true,
      multiple: widget.multiple,
      dense: true,
      widgetName: "v-autocomplete",
      clearable: true,
    };
  },
  //input control
  "v-text-field": (widget) => {
    return {
      ...widget,
      key: widget.key,
      label: widget.text,
      dense: true,
    };
  },
  //Text Office Control
  "v-textarea": (widget) => {
    return {
      ...widget,
      key: widget.key,
      label: widget.text,
      dense: true,
      rows: 1,
    };
  },
  //Tree selection control
  "tree-select": (widget) => {
    return {
      ...widget,
      dense: true,
      model: "",
      label: widget.text,
      treeItem: widget.model,
    };
  },
  "date-picker": (widget) => {
    return {
      ...widget,
      label: widget.text,
      dense: true,
    };
  },
};

//Validator adapter, used to process field validation
export const validatorAdapter = (editField) => {
  const validators = {
    //Required
    required: required(editField.text),
    //mobile phone number
    phone: function (v) {
      return /^1[3456789]\d{9}$/.test(v) || `${editField.text} format error`;
    },
  };

  return editField.rules.map((ruleName) => validators[ruleName]);
};

export const required = function (name) {
  return function (v) {
    return (v !== undefined && v !== null && v !== "") || `${name} cannot be empty`;
  };
};