/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Theme.define("showcase.page.theme.calc.theme.appearance.Modern",
{
  appearances :
  {
    "modern-calculator" : "window",
    "modern-calculator-button" : "button",

    "modern-display" :
    {
      style : function(states)
      {
        return {
          decorator: "main",
          height : 40,
          padding: 3,
          marginBottom: 10
        }
      }
    },

    "modern-display/label" :
    {
      style : function(states)
      {
        return {
          font : "bold",
          marginLeft: 5
        }
      }
    },

    "modern-display/memory" : {
      style : function(states) {
        return {
          marginLeft: 5
        }
      }
    },

    "modern-display/operation" : {
      style : function(states) {
        return {
          marginLeft: 50
        }
      }
    },

    "modern-calculator/display" : "modern-display"
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Interface.define("showcase.page.theme.calc.view.ICalculator",
{
  events : {
    "buttonPress" : "qx.event.type.Data"
  },

  properties :
  {
    display : {},

    memory : {
      check : "Boolean"
    },

    operation : {
      check : "String"
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.page.theme.calc.view.Calculator",
{
  extend : qx.ui.window.Window,
  implement : [showcase.page.theme.calc.view.ICalculator],


  construct : function(isModern)
  {
    this.base(arguments, "Calculator");
    this._isModern = !!isModern;

    if (this._isModern) {
      this.setAppearance("modern-calculator");
    }

    // configure window
    this.set({
      showMinimize: false,
      showMaximize: false,
      allowMaximize: false,
      showClose : false
    });

    // set window layout
    this.setLayout(new qx.ui.layout.VBox());

    // add display and buttons
    this._initButtons();

    this.add(this.getChildControl("display"));
    this.add(this._createButtonContainer(), {flex: 1});

    // attach key event listeners
    this._initKeyIdentifier();
    this.addListener("keydown", this._onKeyDown, this);
    this.addListener("keyup", this._onKeyUp, this);
    this.addListener("keypress", this._onKeyPress, this);
  },


  events : {
    "buttonPress" : "qx.event.type.Data"
  },


  properties :
  {
    appearance :
    {
      refine : true,
      init : "calculator"
    },

    display :
    {
      init : "0",
      event : "changeDisplay"
    },

    memory :
    {
      check : "Boolean",
      init : false,
      event : "changeMemory"
    },

    operation :
    {
      check : "String",
      init : "",
      event : "changeOperation"
    }
  },


  members :
  {
    /** {Map} Maps button ids to the button instances */
    _buttons : null,

    /** {Map} Maps the button's key identifier to the button instances */
    _keyIdentifier : null,

    /** The button, which is currently pressed using the keyboard */
    _pressedButton : null,


    /*
    ---------------------------------------------------------------------------
      INITIALIZATION
    ---------------------------------------------------------------------------
    */

    /**
     * Initialize the buttons and store them in the "_buttons" map.
     */
    _initButtons : function()
    {
      this._buttons =
      {
        "MC": new showcase.page.theme.calc.view.Button("MC", 0, 0),
        "M+": new showcase.page.theme.calc.view.Button("M+", 0, 1),
        "M-": new showcase.page.theme.calc.view.Button("M-", 0, 2),
        "MR": new showcase.page.theme.calc.view.Button("MR", 0, 3),

        "C": new showcase.page.theme.calc.view.Button("C", 1, 0),
        "sign": new showcase.page.theme.calc.view.Button("&plusmn;", 1, 1),
        "/": new showcase.page.theme.calc.view.Button("&divide;", 1, 2, null, null, "/"),
        "*": new showcase.page.theme.calc.view.Button("*", 1, 3, null, null, "*"),

        "7": new showcase.page.theme.calc.view.Button("7", 2, 0, null, null, "7"),
        "8": new showcase.page.theme.calc.view.Button("8", 2, 1, null, null, "8"),
        "9": new showcase.page.theme.calc.view.Button("9", 2, 2, null, null, "9"),
        "-": new showcase.page.theme.calc.view.Button("-", 2, 3, null, null, "-"),

        "4": new showcase.page.theme.calc.view.Button("4", 3, 0, null, null, "4"),
        "5": new showcase.page.theme.calc.view.Button("5", 3, 1, null, null, "5"),
        "6": new showcase.page.theme.calc.view.Button("6", 3, 2, null, null, "6"),
        "+": new showcase.page.theme.calc.view.Button("+", 3, 3, null, null, "+"),

        "1": new showcase.page.theme.calc.view.Button("1", 4, 0, null, null, "1"),
        "2": new showcase.page.theme.calc.view.Button("2", 4, 1, null, null, "2"),
        "3": new showcase.page.theme.calc.view.Button("3", 4, 2, null, null, "3"),
        "=": new showcase.page.theme.calc.view.Button("=", 4, 3, 2, null, "Enter"),

        "0": new showcase.page.theme.calc.view.Button("0", 5, 0, null, 2, "0"),
        ".": new showcase.page.theme.calc.view.Button(".", 5, 2, null, null, ".")
      };

      if (this._isModern)
      {
        for (var key in this._buttons) {
          this._buttons[key].setAppearance("button");
        }
      }
    },


    /**
     * Configures a map, which maps the button's key identifiers to the button.
     * The map is stored in the protected member "_keyIdentifier".
     */
    _initKeyIdentifier : function()
    {
      this._keyIdentifier = []
      for (var name in this._buttons)
      {
        var button = this._buttons[name];
        var key = button.getKeyIdentifier();
        button.addListener("execute", this._onButtonExecute, this);
        if (key) {
          this._keyIdentifier[key] = button;
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      WIDGET CREATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      if (id === "display")
      {
        var display = new showcase.page.theme.calc.view.Display();
        this.bind("display", display, "display");
        this.bind("memory", display, "memory");
        this.bind("operation", display, "operation");
        return display;
      } else {
        return this.base(arguments, id);
      }
    },


    /**
     * Creates the button container and configures it with a flexible grid
     * layout. Further it adds the buttons to the container.
     */
    _createButtonContainer : function()
    {
      var container = new qx.ui.container.Composite();

      // configure button container with a grid layout
      var grid = new qx.ui.layout.Grid(5, 5);
      container.setLayout(grid);

      // make grid resizeable
      for (var row=0; row<6; row++) {
        grid.setRowFlex(row, 1);
      }
      for (var col=0; col<6; col++) {
        grid.setColumnFlex(col, 1);
      }

      // add buttons
      for (var name in this._buttons) {
        container.add(this._buttons[name])
      }
      return container;
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    _onButtonExecute : function(e)
    {
      var name = qx.lang.Object.getKeyFromValue(this._buttons, e.getTarget());
      this.fireDataEvent("buttonPress", name);
    },


    /**
     * Key down event handler. Visually presses the button associated with the
     * pressed key.
     *
     * @param e {qx.event.type.KeySequence} Key event object
     */
    _onKeyDown : function(e)
    {
      var button = this._keyIdentifier[e.getKeyIdentifier()];
      if (!button) {
        return;
      }

      button.press();

      if (this._pressedButton && this._pressedButton !== button) {
        this._pressedButton.release();
      }
      this._pressedButton = button;

      e.stop();
    },


    /**
     * Key up event handler. Visually releases the button associated with the
     * released key.
     *
     * @param e {qx.event.type.KeySequence} Key event object
     */
    _onKeyUp : function(e)
    {
      var button = this._keyIdentifier[e.getKeyIdentifier()];
      if (!button) {
        return;
      }

      button.release();
      e.stop();
    },


    /**
     * Key press event handler. Executes the button associated with the pressed
     * key.
     *
     * @param e {qx.event.type.KeySequence} Key event object
     */
    _onKeyPress : function(e)
    {
      var button = this._keyIdentifier[e.getKeyIdentifier()];
      if (!button) {
        return;
      }

      button.execute();
      e.stop();
    }
  },

  destruct : function()
  {
    this._disposeMap("_buttons");
    this._disposeArray("_keyIdentifier");
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Calculator button
 *
 * This class stores all information needed for a calculator button
 */
qx.Class.define("showcase.page.theme.calc.view.Button",
{
  extend : qx.ui.form.Button,


  /**
   * @param label {String} The button's label
   * @param row {Integer} row of the button
   * @param column {Integer} column of the button
   * @param rowSpan {Integer} rowSpan of the button
   * @param colSpan {Integer} column span of the button
   * @param keyIdentifier {String} name if the key identifier, which should
   *    trigger the button execution
   */
  construct : function(label, row, column, rowSpan, colSpan, keyIdentifier)
  {
    this.base(arguments, label);

    this.set({
      rich: true,
      focusable : false,
      keepActive : true,
      allowShrinkX : false,
      allowShrinkY : false
    });

    this.setLayoutProperties({
      row: row,
      column: column,
      rowSpan: rowSpan || 1,
      colSpan: colSpan ||1
    });

    this._keyIdentifier = keyIdentifier || null;
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "calculator-button"
    }
  },

  members :
  {
    /**
     * Get the key identifier associated with this button
     *
     * @return {String} the key associated with this button
     */
    getKeyIdentifier : function() {
      return this._keyIdentifier;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.page.theme.calc.view.Display",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());

    this._add(this.getChildControl("label"), {top: 0, right: 0});
    this._add(this.getChildControl("memory"), {bottom: 0, left: 0});
    this._add(this.getChildControl("operation"), {bottom: 0, left: 0});
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "display"
    },

    display :
    {
      init : "0",
      apply : "_applyDisplay"
    },

    memory :
    {
      check : "Boolean",
      init : false,
      apply : "_applyMemory"
    },

    operation :
    {
      check : "String",
      init : "",
      apply : "_applyOperation"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getDisplay());
          break;

        case "memory":
          control = new qx.ui.basic.Label("M");
          control.exclude();
          break;

        case "operation":
          control = new qx.ui.basic.Label(this.getOperation());
          control.setRich(true);
          break;
      }

      return control || this.base(arguments, id);
    },


    _applyDisplay : function(value, old) {
      this.getChildControl("label").setValue(value.toString());
    },


    _applyMemory : function(value, old)
    {
      if (value) {
        this._showChildControl("memory");
      } else {
        this._excludeChildControl("memory");
      }
    },


    _applyOperation : function(value, old)
    {
      this.getChildControl("operation").setValue(value.toString());
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.page.theme.calc.Model",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.initState();
  },

  properties :
  {
    state :
    {
      check : ["number", "waitForNumber", "error"],
      event : "changeState",
      init : "number",
      apply : "_applyState"
    },

    errorMessage :
    {
      check : "String",
      init : "",
      event : "changeErrorMessage"
    },

    input :
    {
      check : "String",
      nullable : true,
      event : "changeInput"
    },

    maxInputLength :
    {
      check : "Integer",
      init : 20
    },

    operator :
    {
      check : ["+", "-", "*", "/"],
      nullable : true,
      event : "changeOperator"
    },

    operant :
    {
      check : "Number",
      nullable : true,
      event : "changeOperant"
    },

    value :
    {
      check : "Number",
      nullable : true,
      event : "changeValue"
    },

    memory :
    {
      check : "Number",
      nullable : true,
      event : "changeMemory"
    }
  },

  members :
  {
    readToken : function(token)
    {
      if (token.match(/^[0123456789]$/)) {
        this.__readDigit(token);
      } else if (token.match(/^[\+\-\*\/]$/)) {
        this.__readBinaryOperator(token);
      } else if (token == "sign") {
        this.__readSign();
      } else if (token == ".") {
        this.__readDot();
      } else if (token == "=") {
        this.__readEquals();
      } else if (token == "C") {
        this.__readClear();
      } else if (token == "M+") {
        this.__readMemory(token);
      } else if (token == "M-") {
        this.__readMemory(token);
      } else if (token == "MC") {
        this.__readMemoryClear();
      } else if (token == "MR") {
        this.__readMemoryRestore();
      }
    },


    __getInputAsNumber : function() {
      return parseFloat(this.getInput());
    },


    __compute : function(operant1, operant2, operator)
    {
      switch (operator)
      {
        case "+":
          return operant1 + operant2;
        case "-":
          return operant1 - operant2;
        case "*":
          return operant1 * operant2;
        case "/":
          if (operant2 == 0)
          {
            this.setErrorMessage("Division by zero!");
            this.setState("error");
            return null;
          } else {
            return operant1 / operant2;
          }
      }
    },


    _applyState : function(value, old)
    {
      if (value == "number") {
        this.setInput("0");
      } else if (value == "error") {
        this.setOperator(null);
      }
    },


    __readDigit : function(digit)
    {
      this.setState("number");
      var input = this.getInput();

      if (input.length >= this.getMaxInputLength()-1) {
        return;
      }

      if (digit == "0")
      {
        if (input !== "0") {
          input += "0";
        }
      }
      else
      {
        if (input == "0") {
          input = digit;
        } else {
          input += digit;
        }
      }

      this.setInput(input);
    },


    __readSign : function()
    {
      this.setState("number");
      var input = this.getInput();

      if (input == "0") {
        return;
      }
      var isNegative = input.charAt(0) == "-";
      if (isNegative) {
        input = input.substr(1);
      } else {
        input = "-" + input;
      }
      this.setInput(input);
    },


    __readDot : function()
    {
      this.setState("number");
      var input = this.getInput();

      if (input.length >= this.getMaxInputLength()-1) {
        return;
      }

      var isFraction = input.indexOf(".") !== -1;
      if (!isFraction) {
        input += ".";
      }
      this.setInput(input);
    },


    __readBinaryOperator : function(operator)
    {
      var state = this.getState();

      if (state == "error") {
        return;
      } else if (state == "waitForNumber") {
        this.setOperator(operator);
        return;
      }
      this.setState("waitForNumber");

      var operant = this.__getInputAsNumber();
      var value = this.getValue();

      if (value !== null) {
        this.setValue(this.__compute(value, operant, this.getOperator()));
      } else {
        this.setValue(operant);
      }

      this.setOperant(operant);
      this.setOperator(operator);
    },


    __readEquals : function()
    {
      var operator = this.getOperator();
      if (!operator) {
        return;
      }
      var value = this.getValue();

      if (this.getState() == "waitForNumber")
      {
        this.setValue(this.__compute(value, this.getOperant(), operator));
        return;
      }

      this.setState("waitForNumber");

      var operant = this.__getInputAsNumber();
      this.setOperant(operant);

      this.setValue(this.__compute(value, operant, operator));
    },


    __readClear : function()
    {
      this.setState("number");
      this.setOperator(null);
      this.setValue(null);
      this.setInput("0");
    },


    __readMemory : function(token)
    {
      var state = this.getState();
      var value;

      if (state == "error") {
        return
      } else if (state == "waitForNumber") {
        value = this.getValue();
      } else {
        value = this.__getInputAsNumber();
      }

      var memory = this.getMemory() || 0;
      if (token == "M+") {
        this.setMemory(memory + value);
      } else {
        this.setMemory(memory - value);
      }
    },


    __readMemoryRestore : function()
    {
      var memory = this.getMemory();
      if (memory == null) {
        return;
      }
      this.setState("number");
      this.setInput(memory.toString());
    },


    __readMemoryClear: function() {
      this.setMemory(null);
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.page.theme.calc.Presenter",
{
  extend : qx.core.Object,

  construct : function(view, model)
  {
    this.base(arguments);
    this.setView(view);
    this.setModel(model);
  },

  properties :
  {
    view :
    {
      check : "showcase.page.theme.calc.view.ICalculator",
      apply : "_applyViewModel"
    },

    model :
    {
      apply : "_applyViewModel",
      init : null
    }
  },

  members :
  {
    MAX_DISPLAY_SIZE: 16,

    _applyViewModel : function(value, old)
    {
      if (old) {
        throw new Error("The view and model cannot be changed!");
      }

      var model = this.getModel();
      var view = this.getView();

      if (!model || !view) {
        return;
      }

      this.__bindView();
      this.__bindModel();
    },


    __bindView : function() {
      this.getView().addListener("buttonPress", this._onButtonPress, this);
    },


    _onButtonPress : function(e) {
      this.getModel().readToken(e.getData());
    },


    __bindModel : function()
    {
      var model = this.getModel();
      model.setMaxInputLength(this.MAX_DISPLAY_SIZE);

      var view = this.getView();

      model.bind("operator", view, "operation", {
        converter : function(data) {
          return data ? data : "";
        }
      });
      model.bind("memory", view, "memory", {
        converter : function(memory) {
          return memory === null ? false : true;
        }
      });

      model.addListener("changeState", this._updateDisplay, this);
      model.addListener("changeInput", this._updateDisplay, this);
      model.addListener("changeValue", this._updateDisplay, this);
      model.addListener("changeErrorMessage", this._updateDisplay, this);
    },


    _updateDisplay : function(e)
    {
      var displayValue;
      var model = this.getModel();

      switch(this.getModel().getState())
      {
        case "number":
          displayValue = model.getInput();
          break;

        case "waitForNumber":
          displayValue = model.getValue() + "";
          if (displayValue.length > this.MAX_DISPLAY_SIZE) {

            displayValue = model.getValue().toExponential(this.MAX_DISPLAY_SIZE-7);
          }
          break;

        case "error":
          displayValue = model.getErrorMessage();
          break;
      }

      this.getView().setDisplay(displayValue || "");
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Alexander Steitz (aback)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Modern color theme
 */
qx.Theme.define("qx.theme.modern.Color",
{
  colors :
  {
    /*
    ---------------------------------------------------------------------------
      BACKGROUND COLORS
    ---------------------------------------------------------------------------
    */

    // application, desktop, ...
    "background-application" : "#DFDFDF",

    // pane color for windows, splitpanes, ...
    "background-pane" : "#F3F3F3",

    // textfields, ...
    "background-light" : "#FCFCFC",

    // headers, ...
    "background-medium" : "#EEEEEE",

    // splitpane
    "background-splitpane" : "#AFAFAF",

    // tooltip, ...
    "background-tip" : "#ffffdd",

    // error tooltip
    "background-tip-error": "#C72B2B",

    // tables, ...
    "background-odd" : "#E4E4E4",

    // html area
    "htmlarea-background" : "white",

    // progress bar
    "progressbar-background" : "white",




    /*
    ---------------------------------------------------------------------------
      TEXT COLORS
    ---------------------------------------------------------------------------
    */

    // other types
    "text-light" : "#909090",
    "text-gray" : "#4a4a4a",

    // labels
    "text-label" : "#1a1a1a",

    // group boxes
    "text-title" : "#314a6e",

    // text fields
    "text-input" : "#000000",

    // states
    "text-hovered"  : "#001533",
    "text-disabled" : "#7B7A7E",
    "text-selected" : "#fffefe",
    "text-active"   : "#26364D",
    "text-inactive" : "#404955",
    "text-placeholder" : "#CBC8CD",






    /*
    ---------------------------------------------------------------------------
      BORDER COLORS
    ---------------------------------------------------------------------------
    */

    "border-inner-scrollbar" : "white",

    // menus, tables, scrollbars, list, etc.
    "border-main" : "#4d4d4d",
    "menu-separator-top" : "#C5C5C5",
    "menu-separator-bottom" : "#FAFAFA",

    // between toolbars
    "border-separator" : "#808080",
    "border-toolbar-button-outer" : "#b6b6b6",
    "border-toolbar-border-inner" : "#f8f8f8",
    "border-toolbar-separator-right" : "#f4f4f4",
    "border-toolbar-separator-left" : "#b8b8b8",

    // text fields
    "border-input" : "#334866",
    "border-inner-input" : "white",

    // disabled text fields
    "border-disabled" : "#B6B6B6",

    // tab view, window
    "border-pane" : "#00204D",

    // buttons
    "border-button" : "#666666",

    // tables (vertical line)
    "border-column" : "#CCCCCC",

    // focus state of text fields
    "border-focused" : "#99C3FE",

    // invalid form widgets
    "invalid" : "#990000",
    "border-focused-invalid" : "#FF9999",

    // drag & drop
    "border-dragover" : "#33508D",

    "keyboard-focus" : "black",


    /*
    ---------------------------------------------------------------------------
      TABLE COLORS
    ---------------------------------------------------------------------------
    */

    // equal to "background-pane"
    "table-pane" : "#F3F3F3",

    // own table colors
    // "table-row-background-selected" and "table-row-background-focused-selected"
    // are inspired by the colors of the selection decorator
    "table-focus-indicator" : "#0880EF",
    "table-row-background-focused-selected" : "#084FAB",
    "table-row-background-focused" : "#80B4EF",
    "table-row-background-selected" : "#084FAB",

    // equal to "background-pane" and "background-odd"
    "table-row-background-even" : "#F3F3F3",
    "table-row-background-odd" : "#E4E4E4",

    // equal to "text-selected" and "text-label"
    "table-row-selected" : "#fffefe",
    "table-row" : "#1a1a1a",

    // equal to "border-collumn"
    "table-row-line" : "#CCC",
    "table-column-line" : "#CCC",

    "table-header-hovered" : "white",

    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE TABLE COLORS
    ---------------------------------------------------------------------------
    */

    "progressive-table-header"              : "#AAAAAA",
    "progressive-table-header-border-right" : "#F2F2F2",


    "progressive-table-row-background-even" : "#F4F4F4",
    "progressive-table-row-background-odd"  : "#E4E4E4",

    "progressive-progressbar-background"         : "gray",
    "progressive-progressbar-indicator-done"     : "#CCCCCC",
    "progressive-progressbar-indicator-undone"   : "white",
    "progressive-progressbar-percent-background" : "gray",
    "progressive-progressbar-percent-text"       : "white",


    /*
    ---------------------------------------------------------------------------
      CSS ONLY COLORS
    ---------------------------------------------------------------------------
    */
    "selected-start" : "#004DAD",
    "selected-end" : "#00368A",

    "tabview-background" : "#07125A",

    "shadow" : qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#999999",

    "pane-start" : "#FBFBFB",
    "pane-end" : "#F0F0F0",

    "group-background" : "#E8E8E8",
    "group-border" : "#B4B4B4",

    "radiobutton-background" : "#EFEFEF",

    "checkbox-border" : "#314A6E",
    "checkbox-focus" : "#87AFE7",
    "checkbox-hovered" : "#B2D2FF",
    "checkbox-hovered-inner" : "#D1E4FF",
    "checkbox-inner" : "#EEEEEE",
    "checkbox-start" : "#E4E4E4",
    "checkbox-end" : "#F3F3F3",
    "checkbox-disabled-border" : "#787878",
    "checkbox-disabled-inner" : "#CACACA",
    "checkbox-disabled-start" : "#D0D0D0",
    "checkbox-disabled-end" : "#D8D8D8",
    "checkbox-hovered-inner-invalid" : "#FAF2F2",
    "checkbox-hovered-invalid" : "#F7E9E9",

    "radiobutton-checked" : "#005BC3",
    "radiobutton-disabled" : "#D5D5D5",
    "radiobutton-checked-disabled" : "#7B7B7B",
    "radiobutton-hovered-invalid" : "#F7EAEA",

    "tooltip-error" : "#C82C2C",

    "scrollbar-start" : "#CCCCCC",
    "scrollbar-end" : "#F1F1F1",
    "scrollbar-slider-start" : "#EEEEEE",
    "scrollbar-slider-end" : "#C3C3C3",

    "button-border-disabled" : "#959595",
    "button-start" : "#F0F0F0",
    "button-end" : "#AFAFAF",
    "button-disabled-start" : "#F4F4F4",
    "button-disabled-end" : "#BABABA",
    "button-hovered-start" : "#F0F9FE",
    "button-hovered-end" : "#8EB8D6",
    "button-focused" : "#83BAEA",

    "border-invalid" : "#930000",

    "input-start" : "#F0F0F0",
    "input-end" : "#FBFCFB",
    "input-focused-start" : "#D7E7F4",
    "input-focused-end" : "#5CB0FD",
    "input-focused-inner-invalid" : "#FF6B78",
    "input-border-disabled" : "#9B9B9B",
    "input-border-inner" : "white",

    "toolbar-start" : "#EFEFEF",
    "toolbar-end" : "#DDDDDD",

    "window-border" : "#00204D",
    "window-border-caption" : "#727272",
    "window-caption-active-text" : "white",
    "window-caption-active-start" : "#084FAA",
    "window-caption-active-end" : "#003B91",
    "window-caption-inactive-start" : "#F2F2F2",
    "window-caption-inactive-end" : "#DBDBDB",
    "window-statusbar-background" : "#EFEFEF",

    "tabview-start" : "#FCFCFC",
    "tabview-end" : "#EEEEEE",
    "tabview-inactive" : "#777D8D",
    "tabview-inactive-start" : "#EAEAEA",
    "tabview-inactive-end" : "#CECECE",

    "table-header-start" : "#E8E8E8",
    "table-header-end" : "#B3B3B3",

    "menu-start" : "#E8E8E9",
    "menu-end" : "#D9D9D9",
    "menubar-start" : "#E8E8E8",

    "groupitem-start" : "#A7A7A7",
    "groupitem-end" : "#949494",
    "groupitem-text" : "white",
    "virtual-row-layer-background-even" : "white",
    "virtual-row-layer-background-odd" : "white"
  }
});