/* ************************************************************************

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

************************************************************************ */

/**
 * The button to fill the menubar
 *
 * @childControl arrow {qx.ui.basic.Image} arrow widget to show a submenu is available
 */
qx.Class.define("qx.ui.toolbar.MenuButton",
{
  extend : qx.ui.menubar.Button,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "toolbar-menubutton"
    },

    /** Whether the button should show an arrow to indicate the menu behind it */
    showArrow :
    {
      check : "Boolean",
      init : false,
      themeable : true,
      apply : "_applyShowArrow"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _applyVisibility : function(value, old) {
      this.base(arguments, value, old);

      // hide the menu too
      var menu = this.getMenu();
      if (value != "visible" && menu) {
        menu.hide();
      }

      // trigger a appearance recalculation of the parent
      var parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
      }
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);
          this._addAt(control, 10);
          break;
      }

      return control || this.base(arguments, id);
    },


    // property apply routine
    _applyShowArrow : function(value, old)
    {
      if (value) {
        this._showChildControl("arrow");
      } else {
        this._excludeChildControl("arrow");
      }
    }
  }
});
/* ************************************************************************

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

************************************************************************ */

/**
 * The normal toolbar button. Like a normal {@link qx.ui.form.Button}
 * but with a style matching the toolbar and without keyboard support.
 */
qx.Class.define("qx.ui.toolbar.Button",
{
  extend : qx.ui.form.Button,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, command)
  {
    this.base(arguments, label, icon, command);

    // Toolbar buttons should not support the keyboard events
    this.removeListener("keydown", this._onKeyDown);
    this.removeListener("keyup", this._onKeyUp);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-button"
    },

    show :
    {
      refine : true,
      init : "inherit"
    },

    focusable :
    {
      refine : true,
      init : false
    }
  },

  members : {
    // overridden
    _applyVisibility : function(value, old) {
      this.base(arguments, value, old);
      // trigger a appearance recalculation of the parent
      var parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
      }
    }
  }
});
/* ************************************************************************

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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A basic layout, which supports positioning of child widgets by absolute
 * left/top coordinates. This layout is very simple but should also
 * perform best.
 *
 * *Features*
 *
 * * Basic positioning using <code>left</code> and <code>top</code> properties
 * * Respects minimum and maximum dimensions without skrinking/growing
 * * Margins for top and left side (including negative ones)
 * * Respects right and bottom margins in the size hint
 * * Auto-sizing
 *
 * *Item Properties*
 *
 * <ul>
 * <li><strong>left</strong> <em>(Integer)</em>: The left coordinate in pixel</li>
 * <li><strong>top</strong> <em>(Integer)</em>: The top coordinate in pixel</li>
 * </ul>
 *
 * *Details*
 *
 * The default location of any widget is zero for both
 * <code>left</code> and <code>top</code>.
 *
 * *Example*
 *
 * Here is a little example of how to use the basic layout.
 *
 * <pre class="javascript">
 * var container = new qx.ui.container.Composite(new qx.ui.layout.Basic());
 *
 * // simple positioning
 * container.add(new qx.ui.core.Widget(), {left: 10, top: 10});
 * container.add(new qx.ui.core.Widget(), {left: 100, top: 50});
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/layout/basic.html'>
 * Extended documentation</a> and links to demos of this layout in the qooxdoo manual.
 */
qx.Class.define("qx.ui.layout.Basic",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value)
      {
        this.assert(name == "left" || name == "top", "The property '"+name+"' is not supported by the Basic layout!");
        this.assertInteger(value);
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var child, size, props, left, top;

      // Render children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        props = child.getLayoutProperties();

        left = (props.left || 0) + child.getMarginLeft();
        top = (props.top || 0) + child.getMarginTop();

        child.renderLayout(left, top, size.width, size.height);
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var child, size, props;
      var neededWidth=0, neededHeight=0;
      var localWidth, localHeight;


      // Iterate over children
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        size = child.getSizeHint();
        props = child.getLayoutProperties();

        localWidth = size.width + (props.left || 0) + child.getMarginLeft() + child.getMarginRight();
        localHeight = size.height + (props.top || 0) + child.getMarginTop() + child.getMarginBottom();

        if (localWidth > neededWidth) {
          neededWidth = localWidth;
        }

        if (localHeight > neededHeight) {
          neededHeight = localHeight;
        }
      }


      // Return hint
      return {
        width : neededWidth,
        height : neededHeight
      };
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Form interface for all form widgets which have date as their primary
 * data type like datechooser's.
 */
qx.Interface.define("qx.ui.form.IDateForm",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the value was modified */
    "changeValue" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      VALUE PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the element's value.
     *
     * @param value {Date|null} The new value of the element.
     */
    setValue : function(value) {
      return arguments.length == 1;
    },


    /**
     * Resets the element's value to its initial value.
     */
    resetValue : function() {},


    /**
     * The element's user set value.
     *
     * @return {Date|null} The value.
     */
    getValue : function() {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * A *date chooser* is a small calendar including a navigation bar to switch the shown
 * month. It includes a column for the calendar week and shows one month. Selecting
 * a date is as easy as clicking on it.
 *
 * To be conform with all form widgets, the {@link qx.ui.form.IForm} interface
 * is implemented.
 *
 * The following example creates and adds a date chooser to the root element.
 * A listener alerts the user if a new date is selected.
 *
 * <pre class='javascript'>
 * var chooser = new qx.ui.control.DateChooser();
 * this.getRoot().add(chooser, { left : 20, top: 20});
 *
 * chooser.addListener("changeValue", function(e) {
 *   alert(e.getData());
 * });
 * </pre>
 *
 * Additionally to a selection event an execute event is available which is
 * fired by doubleclick or taping the space / enter key. With this event you
 * can for example save the selection and close the date chooser.
 *
 * @childControl navigation-bar {qx.ui.container.Composite} container for the navigation bar controls
 * @childControl last-year-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the last year button
 * @childControl last-year-button {qx.ui.form.Button} button to jump to the last year
 * @childControl last-month-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the last month button
 * @childControl last-month-button {qx.ui.form.Button} button to jump to the last month
 * @childControl next-month-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the next month button
 * @childControl next-month-button {qx.ui.form.Button} button to jump to the next month
 * @childControl next-year-button-tooltip {qx.ui.tooltip.ToolTip} tooltip for the next year button
 * @childControl next-year-button {qx.ui.form.Button} button to jump to the next year
 * @childControl month-year-label {qx.ui.basic.Label} shows the current month and year
 * @childControl week {qx.ui.basic.Label} week label (used multiple times)
 * @childControl weekday {qx.ui.basic.Label} weekday label (used multiple times)
 * @childControl day {qx.ui.basic.Label} day label (used multiple times)
 * @childControl date-pane {qx.ui.container.Composite} the pane used to position the week, weekday and day labels
 *
 */
qx.Class.define("qx.ui.control.DateChooser",
{
  extend : qx.ui.core.Widget,
  include : [
    qx.ui.core.MExecutable,
    qx.ui.form.MForm
  ],
  implement : [
    qx.ui.form.IExecutable,
    qx.ui.form.IForm,
    qx.ui.form.IDateForm
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param date {Date ? null} The initial date to show. If <code>null</code>
   * the current day (today) is shown.
   */
  construct : function(date)
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.VBox();
    this._setLayout(layout);

    // create the child controls
    this._createChildControl("navigation-bar");
    this._createChildControl("date-pane");

    // Support for key events
    this.addListener("keypress", this._onKeyPress);

    // Show the right date
    var shownDate = (date != null) ? date : new Date();
    this.showMonth(shownDate.getMonth(), shownDate.getFullYear());

    // listen for locale changes
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._updateDatePane, this);
    }

    // register mouse up and down handler
    this.addListener("mousedown", this._onMouseUpDown, this);
    this.addListener("mouseup", this._onMouseUpDown, this);
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {string} The format for the date year label at the top center.
     */
    MONTH_YEAR_FORMAT : qx.locale.Date.getDateTimeFormat("yyyyMMMM", "MMMM yyyy"),

    /**
     * {string} The format for the weekday labels (the headers of the date table).
     */
    WEEKDAY_FORMAT : "EE",

    /**
     * {string} The format for the week numbers (the labels of the left column).
     */
    WEEK_FORMAT : "ww"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init   : "datechooser"
    },

    // overrridden
    width :
    {
      refine : true,
      init : 200
    },

    // overridden
    height :
    {
      refine : true,
      init : 150
    },

    /** The currently shown month. 0 = january, 1 = february, and so on. */
    shownMonth :
    {
      check : "Integer",
      init : null,
      nullable : true,
      event : "changeShownMonth"
    },

    /** The currently shown year. */
    shownYear :
    {
      check : "Integer",
      init : null,
      nullable : true,
      event : "changeShownYear"
    },

    /** The date value of the widget. */
    value :
    {
      check : "Date",
      init : null,
      nullable : true,
      event : "changeValue",
      apply : "_applyValue"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __weekdayLabelArr : null,
    __dayLabelArr : null,
    __weekLabelArr : null,


    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      invalid : true
    },


    /*
    ---------------------------------------------------------------------------
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        // NAVIGATION BAR STUFF
        case "navigation-bar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox());

          // Add the navigation bar elements
          control.add(this.getChildControl("last-year-button"));
          control.add(this.getChildControl("last-month-button"));
          control.add(this.getChildControl("month-year-label"), {flex: 1});
          control.add(this.getChildControl("next-month-button"));
          control.add(this.getChildControl("next-year-button"));

          this._add(control);
          break;

        case "last-year-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Last year"));
          break;

        case "last-year-button":
          control = new qx.ui.toolbar.Button();
          control.addState("lastYear");
          control.setFocusable(false);
          control.setToolTip(this.getChildControl("last-year-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "last-month-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Last month"));
          break;

        case "last-month-button":
          control = new qx.ui.toolbar.Button();
          control.addState("lastMonth");
          control.setFocusable(false);
          control.setToolTip(this.getChildControl("last-month-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "next-month-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Next month"));
          break;

        case "next-month-button":
          control = new qx.ui.toolbar.Button();
          control.addState("nextMonth");
          control.setFocusable(false);
          control.setToolTip(this.getChildControl("next-month-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "next-year-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Next year"));
          break;

        case "next-year-button":
          control = new qx.ui.toolbar.Button();
          control.addState("nextYear");
          control.setFocusable(false);
          control.setToolTip(this.getChildControl("next-year-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "month-year-label":
          control = new qx.ui.basic.Label();
          control.setAllowGrowX(true);
          control.setAnonymous(true);
          break;

        case "week":
          control = new qx.ui.basic.Label();
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);
          control.setSelectable(false);
          control.setAnonymous(true);
          control.setCursor("default");
          break;

        case "weekday":
          control = new qx.ui.basic.Label();
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);
          control.setSelectable(false);
          control.setAnonymous(true);
          control.setCursor("default");
          break;

        case "day":
          control = new qx.ui.basic.Label();
          control.setAllowGrowX(true);
          control.setAllowGrowY(true);
          control.setCursor("default");
          control.addListener("mousedown", this._onDayClicked, this);
          control.addListener("dblclick", this._onDayDblClicked, this);
          break;

        case "date-pane":
          var controlLayout = new qx.ui.layout.Grid()
          control = new qx.ui.container.Composite(controlLayout);

          for (var i = 0; i < 8; i++) {
            controlLayout.setColumnFlex(i, 1);
          }

          for (var i = 0; i < 7; i++) {
            controlLayout.setRowFlex(i, 1);
          }

          // Create the weekdays
          // Add an empty label as spacer for the week numbers
          var label = this.getChildControl("week#0");
          label.addState("header");
          control.add(label, {column: 0, row: 0});

          this.__weekdayLabelArr = [];
          for (var i=0; i<7; i++)
          {
            label = this.getChildControl("weekday#" + i);
            control.add(label, {column: i + 1, row: 0});
            this.__weekdayLabelArr.push(label);
          }

          // Add the days
          this.__dayLabelArr = [];
          this.__weekLabelArr = [];

          for (var y = 0; y < 6; y++)
          {
            // Add the week label
            var label = this.getChildControl("week#" + (y+1));
            control.add(label, {column: 0, row: y + 1});
            this.__weekLabelArr.push(label);

            // Add the day labels
            for (var x = 0; x < 7; x++)
            {
              var label = this.getChildControl("day#" + ((y*7)+x));
              control.add(label, {column:x + 1, row:y + 1});
              this.__dayLabelArr.push(label);
            }
          }

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    // apply methods
    _applyValue : function(value, old)
    {
      if ((value != null) && (this.getShownMonth() != value.getMonth() || this.getShownYear() != value.getFullYear()))
      {
        // The new date is in another month -> Show that month
        this.showMonth(value.getMonth(), value.getFullYear());
      }
      else
      {
        // The new date is in the current month -> Just change the states
        var newDay = (value == null) ? -1 : value.getDate();

        for (var i=0; i<6*7; i++)
        {
          var dayLabel = this.__dayLabelArr[i];

          if (dayLabel.hasState("otherMonth"))
          {
            if (dayLabel.hasState("selected")) {
              dayLabel.removeState("selected");
            }
          }
          else
          {
            var day = parseInt(dayLabel.getValue(), 10);

            if (day == newDay) {
              dayLabel.addState("selected");
            } else if (dayLabel.hasState("selected")) {
              dayLabel.removeState("selected");
            }
          }
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Handler which stops the propagation of the click event if
     * the navigation bar or calendar headers will be clicked.
     *
     * @param e {qx.event.type.Mouse} The mouse up / down event
     */
    _onMouseUpDown : function(e) {
      var target = e.getTarget();

      if (target == this.getChildControl("navigation-bar") ||
          target == this.getChildControl("date-pane")) {
        e.stopPropagation();
        return;
      }
    },


    /**
     * Event handler. Called when a navigation button has been clicked.
     *
     * @param evt {qx.event.type.Data} The data event.
     */
    _onNavButtonClicked : function(evt)
    {
      var year = this.getShownYear();
      var month = this.getShownMonth();

      switch(evt.getCurrentTarget())
      {
        case this.getChildControl("last-year-button"):
          year--;
          break;

        case this.getChildControl("last-month-button"):
          month--;

          if (month < 0)
          {
            month = 11;
            year--;
          }

          break;

        case this.getChildControl("next-month-button"):
          month++;

          if (month >= 12)
          {
            month = 0;
            year++;
          }

          break;

        case this.getChildControl("next-year-button"):
          year++;
          break;
      }

      this.showMonth(month, year);
    },


    /**
     * Event handler. Called when a day has been clicked.
     *
     * @param evt {qx.event.type.Data} The event.
     */
    _onDayClicked : function(evt)
    {
      var time = evt.getCurrentTarget().dateTime;
      this.setValue(new Date(time));
    },


    /**
     * Event handler. Called when a day has been double-clicked.
     */
    _onDayDblClicked : function() {
      this.execute();
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * @param evt {qx.event.type.Data} The event.
     */
    _onKeyPress : function(evt)
    {
      var dayIncrement = null;
      var monthIncrement = null;
      var yearIncrement = null;

      if (evt.getModifiers() == 0)
      {
        switch(evt.getKeyIdentifier())
        {
          case "Left":
            dayIncrement = -1;
            break;

          case "Right":
            dayIncrement = 1;
            break;

          case "Up":
            dayIncrement = -7;
            break;

          case "Down":
            dayIncrement = 7;
            break;

          case "PageUp":
            monthIncrement = -1;
            break;

          case "PageDown":
            monthIncrement = 1;
            break;

          case "Escape":
            if (this.getValue() != null)
            {
              this.setValue(null);
              return true;
            }

            break;

          case "Enter":
          case "Space":
            if (this.getValue() != null) {
              this.execute();
            }

            return;
        }
      }
      else if (evt.isShiftPressed())
      {
        switch(evt.getKeyIdentifier())
        {
          case "PageUp":
            yearIncrement = -1;
            break;

          case "PageDown":
            yearIncrement = 1;
            break;
        }
      }

      if (dayIncrement != null || monthIncrement != null || yearIncrement != null)
      {
        var date = this.getValue();

        if (date != null) {
          date = new Date(date.getTime()); // TODO: Do cloning in getter
        }

        if (date == null) {
          date = new Date();
        }
        else
        {
          if (dayIncrement != null){date.setDate(date.getDate() + dayIncrement);}
          if (monthIncrement != null){date.setMonth(date.getMonth() + monthIncrement);}
          if (yearIncrement != null){date.setFullYear(date.getFullYear() + yearIncrement);}
        }

        this.setValue(date);
      }
    },


    /**
     * Shows a certain month.
     *
     * @param month {Integer ? null} the month to show (0 = january). If not set
     *      the month will remain the same.
     * @param year {Integer ? null} the year to show. If not set the year will
     *      remain the same.
     */
    showMonth : function(month, year)
    {
      if ((month != null && month != this.getShownMonth()) || (year != null && year != this.getShownYear()))
      {
        if (month != null) {
          this.setShownMonth(month);
        }

        if (year != null) {
          this.setShownYear(year);
        }

        this._updateDatePane();
      }
    },


    /**
     * Event handler. Used to handle the key events.
     *
     * @param e {qx.event.type.Data} The event.
     */
    handleKeyPress : function(e) {
      this._onKeyPress(e);
    },


    /**
     * Updates the date pane.
     */
    _updateDatePane : function()
    {
      var DateChooser = qx.ui.control.DateChooser;

      var today = new Date();
      var todayYear = today.getFullYear();
      var todayMonth = today.getMonth();
      var todayDayOfMonth = today.getDate();

      var selDate = this.getValue();
      var selYear = (selDate == null) ? -1 : selDate.getFullYear();
      var selMonth = (selDate == null) ? -1 : selDate.getMonth();
      var selDayOfMonth = (selDate == null) ? -1 : selDate.getDate();

      var shownMonth = this.getShownMonth();
      var shownYear = this.getShownYear();

      var startOfWeek = qx.locale.Date.getWeekStart();

      // Create a help date that points to the first of the current month
      var helpDate = new Date(this.getShownYear(), this.getShownMonth(), 1);

      var monthYearFormat = new qx.util.format.DateFormat(DateChooser.MONTH_YEAR_FORMAT);
      this.getChildControl("month-year-label").setValue(monthYearFormat.format(helpDate));

      // Show the day names
      var firstDayOfWeek = helpDate.getDay();
      var firstSundayInMonth = 1 + ((7 - firstDayOfWeek) % 7);
      var weekDayFormat = new qx.util.format.DateFormat(DateChooser.WEEKDAY_FORMAT);

      for (var i=0; i<7; i++)
      {
        var day = (i + startOfWeek) % 7;

        var dayLabel = this.__weekdayLabelArr[i];

        helpDate.setDate(firstSundayInMonth + day);
        dayLabel.setValue(weekDayFormat.format(helpDate));

        if (qx.locale.Date.isWeekend(day)) {
          dayLabel.addState("weekend");
        } else {
          dayLabel.removeState("weekend");
        }
      }

      // Show the days
      helpDate = new Date(shownYear, shownMonth, 1, 12, 0, 0);
      var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
      helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);

      var weekFormat = new qx.util.format.DateFormat(DateChooser.WEEK_FORMAT);

      for (var week=0; week<6; week++)
      {
        this.__weekLabelArr[week].setValue(weekFormat.format(helpDate));

        for (var i=0; i<7; i++)
        {
          var dayLabel = this.__dayLabelArr[week * 7 + i];

          var year = helpDate.getFullYear();
          var month = helpDate.getMonth();
          var dayOfMonth = helpDate.getDate();

          var isSelectedDate = (selYear == year && selMonth == month && selDayOfMonth == dayOfMonth);

          if (isSelectedDate) {
            dayLabel.addState("selected");
          } else {
            dayLabel.removeState("selected");
          }

          if (month != shownMonth) {
            dayLabel.addState("otherMonth");
          } else {
            dayLabel.removeState("otherMonth");
          }

          var isToday = (year == todayYear && month == todayMonth && dayOfMonth == todayDayOfMonth);

          if (isToday) {
            dayLabel.addState("today");
          } else {
            dayLabel.removeState("today");
          }

          dayLabel.setValue("" + dayOfMonth);
          dayLabel.dateTime = helpDate.getTime();

          // Go to the next day
          helpDate.setDate(helpDate.getDate() + 1);
        }
      }

      monthYearFormat.dispose();
      weekDayFormat.dispose();
      weekFormat.dispose();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._updateDatePane, this);
    }

    this.__weekdayLabelArr = this.__dayLabelArr = this.__weekLabelArr = null;
  }
});
/* ************************************************************************

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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Each object, which should be managed by a {@link RadioGroup} have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.form.IRadioItem",
{

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the item was checked or unchecked */
    "changeValue" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Set whether the item is checked
     *
     * @param value {Boolean} whether the item should be checked
     */
    setValue : function(value) {},


    /**
     * Get whether the item is checked
     *
     * @return {Boolean} whether the item it checked
     */
    getValue : function() {},


    /**
     * Set the radiogroup, which manages this item
     *
     * @param value {qx.ui.form.RadioGroup} The radiogroup, which should
     *     manage the item.
     */
    setGroup : function(value) {
      this.assertInstance(value, qx.ui.form.RadioGroup);
    },


    /**
     * Get the radiogroup, which manages this item
     *
     * @return {qx.ui.form.RadioGroup} The radiogroup, which manages the item.
     */
    getGroup : function() {}
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * This mixin links all methods to manage the single selection.
 *
 * The class which includes the mixin has to implements two methods:
 *
 * <ul>
 * <li><code>_getItems</code>, this method has to return a <code>Array</code>
 *    of <code>qx.ui.core.Widget</code> that should be managed from the manager.
 * </li>
 * <li><code>_isAllowEmptySelection</code>, this method has to return a
 *    <code>Boolean</code> value for allowing empty selection or not.
 * </li>
 * </ul>
 */
qx.Mixin.define("qx.ui.core.MSingleSelectionHandling",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fires after the selection was modified */
    "changeSelection" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.core.SingleSelectionManager} the single selection manager */
    __manager : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {
      var selected = this.__getManager().getSelected();

      if (selected) {
        return [selected];
      } else {
        return [];
      }
    },

    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select.
     * @throws an exception if one of the items is not a child element and if
     *    items contains more than one elements.
     */
    setSelection : function(items) {
      switch(items.length)
      {
        case 0:
          this.resetSelection();
          break;
        case 1:
          this.__getManager().setSelected(items[0]);
          break;
        default:
          throw new Error("Could only select one item, but the selection" +
            " array contains " + items.length + " items!");
      }
    },

    /**
     * Clears the whole selection at once.
     */
    resetSelection : function() {
      this.__getManager().resetSelected();
    },

    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item.
     * @return {Boolean} Whether the item is selected.
     * @throws an exception if one of the items is not a child element.
     */
    isSelected : function(item) {
      return this.__getManager().isSelected(item);
    },

    /**
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty.
     */
    isSelectionEmpty : function() {
      return this.__getManager().isSelectionEmpty();
    },


    /**
     * Returns all elements which are selectable.
     *
     * @param all {boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function(all) {
      return this.__getManager().getSelectables(all);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>changeSelected</code> event on single
     * selection manager.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    _onChangeSelected : function(e) {
      var newValue = e.getData();
      var oldVlaue = e.getOldData();

      newValue == null ? newValue = [] : newValue = [newValue];
      oldVlaue == null ? oldVlaue = [] : oldVlaue = [oldVlaue];

      this.fireDataEvent("changeSelection", newValue, oldVlaue);
    },

    /**
     * Return the selection manager if it is already exists, otherwise creates
     * the manager.
     *
     * @return {qx.ui.core.SingleSelectionManager} Single selection manager.
     */
    __getManager : function()
    {
      if (this.__manager == null)
      {
        var that = this;
        this.__manager = new qx.ui.core.SingleSelectionManager(
        {
          getItems : function() {
            return that._getItems();
          },

          isItemSelectable : function(item) {
            if (that._isItemSelectable) {
              return that._isItemSelectable(item);
            } else {
              return item.isVisible();
            }
          }
        });
        this.__manager.addListener("changeSelected", this._onChangeSelected, this);
      }
      this.__manager.setAllowEmptySelection(this._isAllowEmptySelection());

      return this.__manager;
    }
  },


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  destruct : function() {
    this._disposeObjects("__manager");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Responsible for the single selection management.
 *
 * The class manage a list of {@link qx.ui.core.Widget} which are returned from
 * {@link qx.ui.core.ISingleSelectionProvider#getItems}.
 *
 * @internal
 */
qx.Class.define("qx.ui.core.SingleSelectionManager",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * Construct the single selection manager.
   *
   * @param selectionProvider {qx.ui.core.ISingleSelectionProvider} The provider
   * for selection.
   */
  construct : function(selectionProvider) {
    this.base(arguments);

    if (qx.core.Environment.get("qx.debug")) {
      qx.core.Assert.assertInterface(selectionProvider,
        qx.ui.core.ISingleSelectionProvider,
        "Invalid selectionProvider!");
    }

    this.__selectionProvider = selectionProvider;
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */


  events :
  {
    /** Fires after the selection was modified */
    "changeSelected" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */


  properties :
  {
    /**
     * If the value is <code>true</code> the manager allows an empty selection,
     * otherwise the first selectable element returned from the
     * <code>qx.ui.core.ISingleSelectionProvider</code> will be selected.
     */
    allowEmptySelection :
    {
      check : "Boolean",
      init : true,
      apply : "__applyAllowEmptySelection"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.core.Widget} The selected widget. */
    __selected : null,

    /** {qx.ui.core.ISingleSelectionProvider} The provider for selection management */
    __selectionProvider : null,


    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the current selected element.
     *
     * @return {qx.ui.core.Widget | null} The current selected widget or
     *    <code>null</code> if the selection is empty.
     */
    getSelected : function() {
      return this.__selected;
    },

    /**
     * Selects the passed element.
     *
     * @param item {qx.ui.core.Widget} Element to select.
     * @throws Error if the element is not a child element.
     */
    setSelected : function(item) {
      if (!this.__isChildElement(item)) {
        throw new Error("Could not select " + item +
          ", because it is not a child element!");
      }

      this.__setSelected(item);
    },

    /**
     * Reset the current selection. If {@link #allowEmptySelection} is set to
     * <code>true</code> the first element will be selected.
     */
    resetSelected : function(){
      this.__setSelected(null);
    },

    /**
     * Return <code>true</code> if the passed element is selected.
     *
     * @param item {qx.ui.core.Widget} Element to check if selected.
     * @return {Boolean} <code>true</code> if passed element is selected,
     *    <code>false</code> otherwise.
     * @throws Error if the element is not a child element.
     */
    isSelected : function(item) {
      if (!this.__isChildElement(item)) {
        throw new Error("Could not check if " + item + " is selected," +
          " because it is not a child element!");
      }
      return this.__selected === item;
    },

    /**
     * Returns <code>true</code> if selection is empty.
     *
     * @return {Boolean} <code>true</code> if selection is empty,
     *    <code>false</code> otherwise.
     */
    isSelectionEmpty : function() {
      return this.__selected == null;
    },

    /**
     * Returns all elements which are selectable.
     *
     * @param all {boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables : function(all)
    {
      var items = this.__selectionProvider.getItems();
      var result = [];

      for (var i = 0; i < items.length; i++)
      {
        if (this.__selectionProvider.isItemSelectable(items[i])) {
          result.push(items[i]);
        }
      }

      // in case of an user selecable list, remove the enabled items
      if (!all) {
        for (var i = result.length -1; i >= 0; i--) {
          if (!result[i].getEnabled()) {
            result.splice(i, 1);
          }
        };
      }

      return result;
    },


    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */


    // apply method
    __applyAllowEmptySelection : function(value, old)
    {
      if (!value) {
        this.__setSelected(this.__selected);
      }
    },


    /*
    ---------------------------------------------------------------------------
       HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Set selected element.
     *
     * If passes value is <code>null</code>, the selection will be reseted.
     *
     * @param item {qx.ui.core.Widget | null} element to select, or
     *    <code>null</code> to reset selection.
     */
    __setSelected : function(item) {
      var oldSelected = this.__selected;
      var newSelected = item;

      if (newSelected != null && oldSelected === newSelected) {
        return;
      }

      if (!this.isAllowEmptySelection() && newSelected == null) {
        var firstElement = this.getSelectables(true)[0];

        if (firstElement) {
          newSelected = firstElement;
        }
      }

      this.__selected = newSelected;
      this.fireDataEvent("changeSelected", newSelected, oldSelected);
    },

    /**
     * Checks if passed element is a child element.
     *
     * @param item {qx.ui.core.Widget} Element to check if child element.
     * @return {Boolean} <code>true</code> if element is child element,
     *    <code>false</code> otherwise.
     */
    __isChildElement : function(item)
    {
      var items = this.__selectionProvider.getItems();

      for (var i = 0; i < items.length; i++)
      {
        if (items[i] === item)
        {
          return true;
        }
      }
      return false;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */
  destruct : function() {
    if (this.__selectionProvider.toHashCode) {
      this._disposeObjects("__selectionProvider");
    } else {
      this.__selectionProvider = null;
    }

    this._disposeObjects("__selected");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
/**
 * Defines the callback for the single selection manager.
 *
 * @internal
 */
qx.Interface.define("qx.ui.core.ISingleSelectionProvider",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the elements which are part of the selection.
     *
     * @return {qx.ui.core.Widget[]} The widgets for the selection.
     */
    getItems: function() {},

    /**
     * Returns whether the given item is selectable.
     *
     * @param item {qx.ui.core.Widget} The item to be checked
     * @return {Boolean} Whether the given item is selectable
     */
    isItemSelectable : function(item) {}
  }
});
/* ************************************************************************

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
     * Christian Hagendorn (chris_schmidt)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The radio group handles a collection of items from which only one item
 * can be selected. Selection another item will deselect the previously selected
 * item.
 *
 * This class is e.g. used to create radio groups or {@link qx.ui.form.RadioButton}
 * or {@link qx.ui.toolbar.RadioButton} instances.
 *
 * We also offer a widget for the same purpose which uses this class. So if
 * you like to act with a widget instead of a pure logic coupling of the
 * widgets, take a look at the {@link qx.ui.form.RadioButtonGroup} widget.
 */
qx.Class.define("qx.ui.form.RadioGroup",
{
  extend : qx.core.Object,
  implement : [
    qx.ui.core.ISingleSelection,
    qx.ui.form.IForm,
    qx.ui.form.IModelSelection
  ],
  include : [
    qx.ui.core.MSingleSelectionHandling,
    qx.ui.form.MModelSelection
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * @param varargs {qx.core.Object} A variable number of items, which are
   *     initially added to the radio group, the first item will be selected.
   */
  construct : function(varargs)
  {
    this.base(arguments);

    // create item array
    this.__items = [];

    // add listener before call add!!!
    this.addListener("changeSelection", this.__onChangeSelection, this);

    if (varargs != null) {
      this.add.apply(this, arguments);
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */


  properties :
  {
    /**
     * Whether the radio group is enabled
     */
    enabled :
    {
      check : "Boolean",
      apply : "_applyEnabled",
      event : "changeEnabled",
      init: true
    },

    /**
     * Whether the selection should wrap around. This means that the successor of
     * the last item is the first item.
     */
    wrap :
    {
      check : "Boolean",
      init: true
    },

    /**
     * If is set to <code>true</code> the selection could be empty,
     * otherwise is always one <code>RadioButton</code> selected.
     */
    allowEmptySelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyAllowEmptySelection"
    },

    /**
     * Flag signaling if the group at all is valid. All children will have the
     * same state.
     */
    valid : {
      check : "Boolean",
      init : true,
      apply : "_applyValid",
      event : "changeValid"
    },

    /**
     * Flag signaling if the group is required.
     */
    required : {
      check : "Boolean",
      init : false,
      event : "changeRequired"
    },

    /**
     * Message which is shown in an invalid tooltip.
     */
    invalidMessage : {
      check : "String",
      init: "",
      event : "changeInvalidMessage",
      apply : "_applyInvalidMessage"
    },


    /**
     * Message which is shown in an invalid tooltip if the {@link #required} is
     * set to true.
     */
    requiredInvalidMessage : {
      check : "String",
      nullable : true,
      event : "changeInvalidMessage"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.form.IRadioItem[]} The items of the radio group */
    __items : null,


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */


    /**
     * Get all managed items
     *
     * @return {qx.ui.form.IRadioItem[]} All managed items.
     */
    getItems : function() {
      return this.__items;
    },


    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */


    /**
     * Add the passed items to the radio group.
     *
     * @param varargs {qx.ui.form.IRadioItem} A variable number of items to add.
     */
    add : function(varargs)
    {
      var items = this.__items;
      var item;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        item = arguments[i];

        if (qx.lang.Array.contains(items, item)) {
          continue;
        }

        // Register listeners
        item.addListener("changeValue", this._onItemChangeChecked, this);

        // Push RadioButton to array
        items.push(item);

        // Inform radio button about new group
        item.setGroup(this);

        // Need to update internal value?
        if (item.getValue()) {
          this.setSelection([item]);
        }
      }

      // Select first item when only one is registered
      if (!this.isAllowEmptySelection() && items.length > 0 && !this.getSelection()[0]) {
        this.setSelection([items[0]]);
      }
    },

    /**
     * Remove an item from the radio group.
     *
     * @param item {qx.ui.form.IRadioItem} The item to remove.
     */
    remove : function(item)
    {
      var items = this.__items;
      if (qx.lang.Array.contains(items, item))
      {
        // Remove RadioButton from array
        qx.lang.Array.remove(items, item);

        // Inform radio button about new group
        if (item.getGroup() === this) {
          item.resetGroup();
        }

        // Deregister listeners
        item.removeListener("changeValue", this._onItemChangeChecked, this);

        // if the radio was checked, set internal selection to null
        if (item.getValue()) {
          this.resetSelection();
        }
      }
    },


    /**
     * Returns an array containing the group's items.
     *
     * @return {qx.ui.form.IRadioItem[]} The item array
     */
    getChildren : function()
    {
      return this.__items;
    },


    /*
    ---------------------------------------------------------------------------
      LISTENER FOR ITEM CHANGES
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>changeValue</code> event of every managed item.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onItemChangeChecked : function(e)
    {
      var item = e.getTarget();
      if (item.getValue()) {
        this.setSelection([item]);
      } else if (this.getSelection()[0] == item) {
        this.resetSelection();
      }
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // property apply
    _applyInvalidMessage : function(value, old) {
      for (var i = 0; i < this.__items.length; i++) {
        this.__items[i].setInvalidMessage(value);
      }
    },

    // property apply
    _applyValid: function(value, old) {
      for (var i = 0; i < this.__items.length; i++) {
        this.__items[i].setValid(value);
      }
    },

    // property apply
    _applyEnabled : function(value, old)
    {
      var items = this.__items;
      if (value == null)
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].resetEnabled();
        }
      }
      else
      {
        for (var i=0, l=items.length; i<l; i++) {
          items[i].setEnabled(value);
        }
      }
    },

    // property apply
    _applyAllowEmptySelection : function(value, old)
    {
      if (!value && this.isSelectionEmpty()) {
        this.resetSelection();
      }
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION
    ---------------------------------------------------------------------------
    */


    /**
     * Select the item following the given item.
     */
    selectNext : function()
    {
      var item = this.getSelection()[0];
      var items = this.__items;
      var index = items.indexOf(item);
      if (index == -1) {
        return;
      }

      var i = 0;
      var length = items.length;

      // Find next enabled item
      if (this.getWrap()) {
        index = (index + 1) % length;
      } else {
        index = Math.min(index + 1, length - 1);
      }

      while (i < length && !items[index].getEnabled())
      {
        index = (index + 1) % length;
        i++;
      }

      this.setSelection([items[index]]);
    },


    /**
     * Select the item previous the given item.
     */
    selectPrevious : function()
    {
      var item = this.getSelection()[0];
      var items = this.__items;
      var index = items.indexOf(item);
      if (index == -1) {
        return;
      }

      var i = 0;
      var length = items.length;

      // Find previous enabled item
      if (this.getWrap()) {
        index = (index - 1 + length) % length;
      } else {
        index = Math.max(index - 1, 0);
      }

      while (i < length && !items[index].getEnabled())
      {
        index = (index - 1 + length) % length;
        i++;
      }

      this.setSelection([items[index]]);
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS FOR SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the items for the selection.
     *
     * @return {qx.ui.form.IRadioItem[]} Items to select.
     */
    _getItems : function() {
      return this.getItems();
    },

    /**
     * Returns if the selection could be empty or not.
     *
     * @return {Boolean} <code>true</code> If selection could be empty,
     *    <code>false</code> otherwise.
     */
    _isAllowEmptySelection: function() {
      return this.isAllowEmptySelection();
    },


    /**
     * Returns whether the item is selectable. In opposite to the default
     * implementation (which checks for visible items) every radio button
     * which is part of the group is selected even if it is currently not visible.
     *
     * @param item {qx.ui.form.IRadioItem} The item to check if its selectable.
     * @return {Boolean} <code>true</code> if the item is part of the radio group
     *    <code>false</code> otherwise.
     */
    _isItemSelectable : function(item) {
      return this.__items.indexOf(item) != -1;
    },


    /**
     * Event handler for <code>changeSelection</code>.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    __onChangeSelection : function(e)
    {
      var value = e.getData()[0];
      var old = e.getOldData()[0];

      if (old) {
        old.setValue(false);
      }

      if (value) {
        value.setValue(true);
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */


  destruct : function() {
    this._disposeArray("__items");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * A toggle Button widget
 *
 * If the user presses the button by clicking on it pressing the enter or
 * space key, the button toggles between the pressed an not pressed states.
 * There is no execute event, only a {@link qx.ui.form.ToggleButton#changeValue}
 * event.
 */
qx.Class.define("qx.ui.form.ToggleButton",
{
  extend : qx.ui.basic.Atom,
  include : [
    qx.ui.core.MExecutable
  ],
  implement : [
    qx.ui.form.IBooleanForm,
    qx.ui.form.IExecutable,
    qx.ui.form.IRadioItem
  ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a ToggleButton.
   *
   * @param label {String} The text on the button.
   * @param icon {String} An URI to the icon of the button.
   */
  construct : function(label, icon)
  {
    this.base(arguments, label, icon);

    // register mouse events
    this.addListener("mouseover", this._onMouseOver);
    this.addListener("mouseout", this._onMouseOut);
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);

    // register keyboard events
    this.addListener("keydown", this._onKeyDown);
    this.addListener("keyup", this._onKeyUp);

    // register execute event
    this.addListener("execute", this._onExecute, this);

  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties:
  {
    // overridden
    appearance:
    {
      refine: true,
      init: "button"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    /** The value of the widget. True, if the widget is checked. */
    value :
    {
      check : "Boolean",
      nullable : true,
      event : "changeValue",
      apply : "_applyValue",
      init : false
    },

    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons. */
    group :
    {
      check  : "qx.ui.form.RadioGroup",
      nullable : true,
      apply : "_applyGroup"
    },

    /**
    * Whether the button has a third state. Use this for tri-state checkboxes.
    *
    * When enabled, the value null of the property value stands for "undetermined",
    * while true is mapped to "enabled" and false to "disabled" as usual. Note
    * that the value property is set to false initially.
    *
    */
    triState :
    {
      check : "Boolean",
      apply : "_applyTriState",
      nullable : true,
      init : null
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons */
    _applyGroup : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    /**
     * Changes the state of the button dependent on the checked value.
     *
     * @param value {Boolean} Current value
     * @param old {Boolean} Previous value
     */
    _applyValue : function(value, old) {
      value ? this.addState("checked") : this.removeState("checked");

      if (this.isTriState()) {
        if (value === null) {
          this.addState("undetermined");
        } else if (old === null) {
          this.removeState("undetermined");
        }
      }
    },

    /**
    * Apply value property when triState property is modified.
    *
    * @param value {Boolean} Current value
    * @param old {Boolean} Previous value
    */
    _applyTriState : function(value, old) {
      this._applyValue(this.getValue());
    },


    /**
     * Handler for the execute event.
     *
     * @param e {qx.event.type.Event} The execute event.
     */
    _onExecute : function(e) {
      this.toggleValue();
    },


    /**
     * Listener method for "mouseover" event.
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseOver : function(e)
    {
      if (e.getTarget() !== this) {
        return;
      }

      this.addState("hovered");

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
      }
    },


    /**
     * Listener method for "mouseout" event.
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" state (if "pressed" state is set)</li>
     * <li>Removes "pressed" state (if "pressed" state is set and button is not checked)
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseOut : function(e)
    {
      if (e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        if (!this.getValue()) {
          this.removeState("pressed");
        }

        this.addState("abandoned");
      }
    },


    /**
     * Listener method for "mousedown" event.
     * <ul>
     * <li>Activates capturing</li>
     * <li>Removes "abandoned" state</li>
     * <li>Adds "pressed" state</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseDown : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      // Activate capturing if the button get a mouseout while
      // the button is pressed.
      this.capture();

      this.removeState("abandoned");
      this.addState("pressed");
      e.stopPropagation();
    },


    /**
     * Listener method for "mouseup" event.
     * <ul>
     * <li>Releases capturing</li>
     * <li>Removes "pressed" state (if not "abandoned" state is set and "pressed" state is set)</li>
     * <li>Removes "abandoned" state (if set)</li>
     * <li>Toggles {@link #value} (if state "abandoned" is not set and state "pressed" is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseUp : function(e)
    {
      this.releaseCapture();

      if (this.hasState("abandoned")) {
        this.removeState("abandoned");
      } else if (this.hasState("pressed")) {
        this.execute();
      }

      this.removeState("pressed");
      e.stopPropagation();
    },


    /**
     * Listener method for "keydown" event.<br/>
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space"
     *
     * @param e {Event} Key event
     * @return {void}
     */
    _onKeyDown : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          this.removeState("abandoned");
          this.addState("pressed");

          e.stopPropagation();
      }
    },


    /**
     * Listener method for "keyup" event.<br/>
     * Removes "abandoned" and "pressed" state (if "pressed" state is set)
     * for the keys "Enter" or "Space". It also toggles the {@link #value} property.
     *
     * @param e {Event} Key event
     * @return {void}
     */
    _onKeyUp : function(e)
    {
      if (!this.hasState("pressed")) {
        return;
      }

      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          this.removeState("abandoned");
          this.execute();

          this.removeState("pressed");
          e.stopPropagation();
      }
    }
  }
});
/* ************************************************************************

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

************************************************************************ */

/**
 * A button which is toggle-able for toolbars.
 */
qx.Class.define("qx.ui.toolbar.CheckBox",
{
  extend : qx.ui.form.ToggleButton,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon)
  {
    this.base(arguments, label, icon);

    // Toolbar buttons should not support the keyboard events
    this.removeListener("keydown", this._onKeyDown);
    this.removeListener("keyup", this._onKeyUp);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-button"
    },

    show :
    {
      refine : true,
      init : "inherit"
    },

    focusable :
    {
      refine : true,
      init : false
    }
  },

  members : {
    // overridden
    _applyVisibility : function(value, old) {
      this.base(arguments, value, old);
      // trigger a appearance recalculation of the parent
      var parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
      }
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Fabian Jakobs (fjakobs)
   * Alexander Steitz (aback)
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/office-document.png)

#asset(qx/icon/Tango/16/actions/window-close.png)

#asset(qx/icon/Tango/22/places/folder-open.png)
#asset(qx/icon/Tango/22/places/folder.png)
#asset(qx/icon/Tango/22/mimetypes/office-document.png)

#asset(qx/icon/Tango/32/places/folder-open.png)
#asset(qx/icon/Tango/32/places/folder.png)
#asset(qx/icon/Tango/32/mimetypes/office-document.png)

#asset(qx/icon/Tango/16/apps/office-calendar.png)
#asset(qx/icon/Tango/16/apps/utilities-color-chooser.png)
#asset(qx/icon/Tango/16/actions/view-refresh.png)

#asset(qx/icon/Tango/16/actions/dialog-cancel.png)
#asset(qx/icon/Tango/16/actions/dialog-ok.png)

#asset(qx/decoration/Modern/*)

************************************************************************* */

/**
 * The modern appearance theme.
 */
qx.Theme.define("qx.theme.modern.Appearance",
{
  appearances :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "widget" : {},

    "root" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background-application",
          textColor       : "text-label",
          font            : "default"
        };
      }
    },

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "move-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },

    "resize-frame" : "move-frame",

    "dragdrop-cursor" :
    {
      style : function(states)
      {
        var icon = "nodrop";

        if (states.copy) {
          icon = "copy";
        } else if (states.move) {
          icon = "move";
        } else if (states.alias) {
          icon = "alias";
        }

        return {
          source : "decoration/cursors/" + icon + ".gif",
          position : "right-top",
          offset : [ 2, 16, 2, 6 ]
        };
      }
    },

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : 1
        };
      }
    },

    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",

    "popup" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.boxshadow");

        return {
          decorator : useCSS ? "popup-css" : "main",
          backgroundColor : "background-light",
          shadow : useCSS ? undefined : "shadow-popup"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button-frame" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator, textColor;
        var padding = [3, 9]; // default padding css-case

        if (states.checked && states.focused && !states.inner)
        {
          decorator = "button-checked-focused";
          textColor = undefined;
          padding = [1, 7];
        }
        else if (states.disabled)
        {
          decorator = "button-disabled";
          textColor = undefined;
        }
        else if (states.pressed)
        {
          decorator = "button-pressed";
          textColor = "text-hovered";
        }
        else if (states.checked)
        {
          decorator = "button-checked";
          textColor = undefined;
        }
        else if (states.hovered)
        {
          decorator = "button-hovered";
          textColor = "text-hovered";
        }
        else if (states.focused && !states.inner)
        {
          decorator = "button-focused";
          textColor = undefined;
          padding = [1, 7];
        }
        else
        {
          decorator = "button";
          textColor = undefined;
        }

        var shadow;
        // feature detect if we should use the CSS decorators
        if (qx.core.Environment.get("css.borderradius") &&
            qx.core.Environment.get("css.gradient.linear")) {
          if (states.invalid && !states.disabled) {
            decorator += "-invalid-css";
          } else {
            decorator += "-css";
          }
        } else {
          shadow = states.invalid && !states.disabled ? "button-invalid-shadow" : undefined;
          padding = [2, 8];
        }

        return {
          decorator : decorator,
          textColor : textColor,
          shadow : shadow,
          padding : padding,
          margin : [1, 0]
        };
      }
    },

    "button-frame/image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.5 : 1
        };
      }
    },

    "button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          center : true
        };
      }
    },

    "hover-button" :
    {
      alias : "atom",
      include : "atom",

      style : function(states)
      {
        var decorator = states.hovered ? "selected" : undefined;
        if (decorator && qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }
        return {
          decorator : decorator,
          textColor : states.hovered ? "text-selected" : undefined
        };
      }
    },

    "splitbutton" : {},
    "splitbutton/button" : "button",
    "splitbutton/arrow" :
    {
      alias : "button",
      include : "button",

      style : function(states, superStyles)
      {
        return {
          icon : "decoration/arrows/down.png",
          padding : [superStyles.padding[0], superStyles.padding[1] - 6],
          marginLeft : 1
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */

    "form-renderer-label" : {
      include : "label",
      style : function() {
        return {
          paddingTop: 4
        };
      }
    },

    "checkbox":
    {
      alias : "atom",

      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");

        var icon;
        if (useCSS) {
          if (states.checked) {
            icon = "decoration/form/checked.png";
          } else if (states.undetermined) {
            icon = "decoration/form/undetermined.png";
          } else {
            icon = "qx/static/blank.gif";
          }

        } else {
          // The "disabled" icon is set to an icon **without** the -disabled
          // suffix on purpose. This is because the Image widget handles this
          // already by replacing the current image with a disabled version
          // (if available). If no disabled image is found, the opacity style
          // is used.

          // Checked
          if (states.checked) {
            if (states.disabled) {
              icon = "checkbox-checked";
            } else if (states.focused) {
              icon = "checkbox-checked-focused";
            } else if (states.pressed) {
              icon = "checkbox-checked-pressed";
            } else if (states.hovered) {
              icon = "checkbox-checked-hovered";
            } else {
              icon = "checkbox-checked";
            }

          // Undetermined
          } else if (states.undetermined) {
            if (states.disabled) {
              icon = "checkbox-undetermined";
            } else if (states.focused) {
              icon = "checkbox-undetermined-focused";
            } else if (states.hovered) {
              icon = "checkbox-undetermined-hovered";
            } else {
              icon = "checkbox-undetermined";
            }

          // Focused & Pressed & Hovered (when enabled)
          } else if (!states.disabled) {
            if (states.focused) {
              icon = "checkbox-focused";
            } else if (states.pressed) {
              icon = "checkbox-pressed";
            } else if (states.hovered ) {
              icon = "checkbox-hovered";
            }
          }

          // Unchecked
          icon = icon || "checkbox";

          var invalid = states.invalid && !states.disabled ? "-invalid" : "";
          icon = "decoration/form/" + icon + invalid + ".png";
        }

        return {
          icon: icon,
          minWidth : useCSS ? 14 : undefined, // ensure that we have the old padding
          gap: useCSS ? 8 : 6 // use a bigger gap because of the shadow (glow)
        };
      }
    },

    "checkbox/icon" : {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");
        if (!useCSS) {
          // same as image
          return {opacity : !states.replacement && states.disabled ? 0.3 : 1};
        }

        var decorator;

        if (states.disabled) {
          decorator = "checkbox-disabled";
        } else if (states.focused) {
          decorator = "checkbox-focused";
        } else if (states.hovered) {
          decorator = "checkbox-hovered";
        } else {
          decorator = "checkbox";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        var padding;
        // Undetermined
        if (states.undetermined) {
          padding = [2, 0];
        }

        return {
          decorator : decorator,
          padding : padding,
          width: 12, // use 12 to allow the inset of the decorator to be applied
          height: 10
        }
      }
    },

    "radiobutton":
    {
      alias : "atom",

      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.boxshadow");

        var icon;
        if (useCSS) {
          icon = "qx/static/blank.gif";
        } else {
          // "disabled" state is not handled here with purpose. The image widget
          // does handle this already by replacing the current image with a
          // disabled version (if available). If no disabled image is found the
          // opacity style is used.
          if (states.checked && states.focused) {
            icon = "radiobutton-checked-focused";
          } else if (states.checked && states.disabled) {
            icon = "radiobutton-checked-disabled";
          } else if (states.checked && states.hovered) {
            icon = "radiobutton-checked-hovered";
          } else if (states.checked) {
            icon = "radiobutton-checked";
          } else if (states.focused) {
            icon = "radiobutton-focused";
          } else if (states.hovered) {
            icon = "radiobutton-hovered";
          } else {
            icon = "radiobutton";
          }

          var invalid = states.invalid && !states.disabled ? "-invalid" : "";
          icon = "decoration/form/" + icon + invalid + ".png";
        }
        return {
          icon: icon,
          gap : useCSS ? 8 : 6 // use a bigger gap because of the shadow (glow)
        };
      }
    },

    "radiobutton/icon" : {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.boxshadow");
        if (!useCSS) {
          // same as image
          return {opacity : !states.replacement && states.disabled ? 0.3 : 1};
        }

        var decorator;

        if (states.disabled && !states.checked) {
          decorator = "radiobutton-disabled";
        } else if (states.checked && states.focused) {
          decorator = "radiobutton-checked-focused";
        } else if (states.checked && states.disabled) {
          decorator = "radiobutton-checked-disabled";
        } else if (states.checked && states.hovered) {
          decorator = "radiobutton-checked-hovered";
        } else if (states.checked) {
          decorator = "radiobutton-checked";
        } else if (states.focused) {
          decorator = "radiobutton-focused";
        } else if (states.hovered) {
          decorator = "radiobutton-hovered";
        } else {
          decorator = "radiobutton";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        return {
          decorator : decorator,
          width: 12, // use 12 to allow the inset of the decorator to be applied
          height: 10
        }
      }
    },

    "textfield" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = "text-input";
        }

        return {
          decorator : decorator,
          padding : [ 2, 4, 1 ],
          textColor : textColor
        };
      }
    },

    "textarea" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          padding   : 4
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          decorator : decorator
        };
      }
    },

    "spinner/textfield" :
    {
      style : function(states)
      {
        return {
          marginRight: 2,
          padding: [2, 4, 1],
          textColor: states.disabled ? "text-disabled" : "text-input"
        };
      }
    },

    "spinner/upbutton" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states, superStyles)
      {
        return {
          icon : "decoration/arrows/up-small.png",
          padding : [superStyles.padding[0] - 1, superStyles.padding[1] - 5],
          shadow: undefined,
          margin : 0
        };
      }
    },

    "spinner/downbutton" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states, superStyles)
      {
        return {
          icon : "decoration/arrows/down-small.png",
          padding : [superStyles.padding[0] - 1, superStyles.padding[1] - 5],
          shadow: undefined,
          margin : 0
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      DATEFIELD
    ---------------------------------------------------------------------------
    */

    "datefield" : "combobox",

    "datefield/button" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "icon/16/apps/office-calendar.png",
          padding : [0, 3],
          decorator : undefined
        };
      }
    },

    "datefield/textfield" : "combobox/textfield",

    "datefield/list" :
    {
      alias : "datechooser",
      include : "datechooser",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "groupbox" :
    {
      style : function(states)
      {
        return {
          legendPosition : "top"
        };
      }
    },

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : states.invalid ? "invalid" : "text-title",
          font      : "bold"
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius");
        return {
          padding : useCSS ? 10 : 12,
          margin : useCSS ? 1 : undefined,
          decorator : useCSS ? "group-css" : "group"
        };
      }
    },


    "check-groupbox" : "groupbox",

    "check-groupbox/legend" :
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : states.invalid ? "invalid" : "text-title",
          font      : "bold"
        };
      }
    },

    "radio-groupbox" : "groupbox",

    "radio-groupbox/legend" :
    {
      alias : "radiobutton",
      include : "radiobutton",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : states.invalid ? "invalid" : "text-title",
          font      : "bold"
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea" :
    {
      style : function(states)
      {
        return {
          // since the scroll container disregards the min size of the scrollbars
          // we have to set the min size of the scroll area to ensure that the
          // scrollbars always have an usable size.
          minWidth : 50,
          minHeight : 50
        };
      }
    },

    "scrollarea/corner" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background-application"
        };
      }
    },

    "scrollarea/pane" : "widget",
    "scrollarea/scrollbar-x" : "scrollbar",
    "scrollarea/scrollbar-y" : "scrollbar",






    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    "scrollbar" :
    {
      style : function(states)
      {
        if (states["native"]) {
          return {};
        }

        var useCSS = qx.core.Environment.get("css.gradient.linear");
        var decorator = states.horizontal ? "scrollbar-horizontal" : "scrollbar-vertical";
        if (useCSS) {
          decorator += "-css";
        }

        return {
          width     : states.horizontal ? undefined : 16,
          height    : states.horizontal ? 16 : undefined,
          decorator : decorator,
          padding   : 1
        };
      }
    },

    "scrollbar/slider" :
    {
      alias : "slider",

      style : function(states)
      {
        return {
          padding : states.horizontal ? [0, 1, 0, 1] : [1, 0, 1, 0]
        };
      }
    },

    "scrollbar/slider/knob" :
    {
      include : "button-frame",

      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear");

        var decorator = states.horizontal ? "scrollbar-slider-horizontal" :
                                            "scrollbar-slider-vertical";
        if (states.disabled) {
          decorator += "-disabled";
        }
        if (useCSS) {
          decorator += "-css";
        }

        return {
          decorator : decorator,
          minHeight : states.horizontal ? undefined : 9,
          minWidth  : states.horizontal ? 9 : undefined,
          padding : undefined,
          margin : 0
        };
      }
    },

    "scrollbar/button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        var icon = "decoration/scrollbar/scrollbar-";
        if (states.left) {
          icon += "left.png";
        } else if (states.right) {
          icon += "right.png";
        } else if (states.up) {
          icon += "up.png";
        } else {
          icon += "down.png";
        }

        var useCSS = qx.core.Environment.get("css.gradient.linear");

        if (states.left || states.right)
        {
          var paddingLeft = states.left ? 3 : 4;
          return {
            padding : useCSS ? [3, 0, 3, paddingLeft] : [2, 0, 2, paddingLeft],
            icon : icon,
            width: 15,
            height: 14,
            margin: 0
          };
        }
        else
        {

          return {
            padding : useCSS ? 3 : [3, 2],
            icon : icon,
            width: 14,
            height: 15,
            margin: 0
          };
        }
      }
    },

    "scrollbar/button-begin" : "scrollbar/button",
    "scrollbar/button-end" : "scrollbar/button",





    /*
    ---------------------------------------------------------------------------
      SLIDER
    ---------------------------------------------------------------------------
    */

    "slider" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          decorator : decorator
        };
      }
    },

    "slider/knob" :
    {
      include : "button-frame",

      style : function(states)
      {
        return {
          decorator : states.disabled ? "scrollbar-slider-horizontal-disabled" :
                                        "scrollbar-slider-horizontal",
          shadow: undefined,
          height : 14,
          width : 14,
          padding: 0
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      alias : "scrollarea",

      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          backgroundColor : "background-light",
          decorator : decorator
        };
      }
    },

    "list/pane" : "widget",

    "listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator;
        if (states.dragover) {
          decorator = states.selected ? "selected-dragover" : "dragover";
        } else {
          decorator = states.selected ? "selected" : undefined;
          if (decorator && qx.core.Environment.get("css.gradient.linear")) {
            decorator += "-css";
          }
        }

        return {
          padding   : states.dragover ? [4, 4, 2, 4] : 4,
          textColor : states.selected ? "text-selected" : undefined,
          decorator : decorator
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      SLIDEBAR
    ---------------------------------------------------------------------------
    */

    "slidebar" : {},
    "slidebar/scrollpane" : {},
    "slidebar/content" : {},

    "slidebar/button-forward" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          padding : 5,
          center : true,
          icon : states.vertical ?
            "decoration/arrows/down.png" :
            "decoration/arrows/right.png"
        };
      }
    },

    "slidebar/button-backward" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          padding : 5,
          center : true,
          icon : states.vertical ?
            "decoration/arrows/up.png" :
            "decoration/arrows/left.png"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tabview" :
    {
      style : function(states)
      {
        return {
          contentPadding : 16
        };
      }
    },

    "tabview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.boxshadow") &&
          qx.core.Environment.get("css.gradient.linear");

        var result =
        {
          marginBottom : states.barTop ? -1 : 0,
          marginTop : states.barBottom ? useCSS ? -4 : -7 : 0,
          marginLeft : states.barRight ? useCSS ? -3 : -5 : 0,
          marginRight : states.barLeft ? -1 : 0,
          paddingTop : 0,
          paddingRight : 0,
          paddingBottom : 0,
          paddingLeft : 0
        };

        if (states.barTop || states.barBottom)
        {
          result.paddingLeft = 5;
          result.paddingRight = 7;
        }
        else
        {
          result.paddingTop = 5;
          result.paddingBottom = 7;
        }

        return result;
      }
    },

    "tabview/bar/button-forward" :
    {
      include : "slidebar/button-forward",
      alias : "slidebar/button-forward",

      style : function(states)
      {
        if (states.barTop || states.barBottom)
        {
          return {
            marginTop : 2,
            marginBottom: 2
          };
        }
        else
        {
          return {
            marginLeft : 2,
            marginRight : 2
          };
        }
      }
    },

    "tabview/bar/button-backward" :
    {
      include : "slidebar/button-backward",
      alias : "slidebar/button-backward",

      style : function(states)
      {
        if (states.barTop || states.barBottom)
        {
          return {
            marginTop : 2,
            marginBottom: 2
          };
        }
        else
        {
          return {
            marginLeft : 2,
            marginRight : 2
          };
        }
      }
    },

    "tabview/bar/scrollpane" : {},

    "tabview/pane" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.borderradius");
        return {
          decorator : useCSS ? "tabview-pane-css" : "tabview-pane",
          minHeight : 100,

          marginBottom : states.barBottom ? -1 : 0,
          marginTop : states.barTop ? -1 : 0,
          marginLeft : states.barLeft ? -1 : 0,
          marginRight : states.barRight ? -1 : 0
        };
      }
    },

    "tabview-page" : {
      alias : "widget",
      include : "widget",

      style : function(states) {
        // is used for the padding of the pane
        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.borderradius");
        return {
          padding : useCSS ? [4, 3] : undefined
        }
      }
    },

    "tabview-page/button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator, padding=0;
        var marginTop=0, marginBottom=0, marginLeft=0, marginRight=0;

        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.boxshadow") &&
          qx.core.Environment.get("css.gradient.linear");

        if (states.checked)
        {
          if (states.barTop)
          {
            decorator = "tabview-page-button-top-active";
            padding = useCSS ? [5, 11] : [ 6, 14 ];
            marginLeft = states.firstTab ? 0 : -5;
            marginRight = states.lastTab ? 0 : -5;
          }
          else if (states.barBottom)
          {
            decorator = "tabview-page-button-bottom-active";
            padding = useCSS ? [5, 11] : [ 6, 14 ];
            marginLeft = states.firstTab ? 0 : -5;
            marginRight = states.lastTab ? 0 : -5;
            marginTop = 3;
          }
          else if (states.barRight)
          {
            decorator = "tabview-page-button-right-active";
            padding = useCSS ? [5, 10] : [ 6, 13 ];
            marginTop = states.firstTab ? 0 : -5;
            marginBottom = states.lastTab ? 0 : -5;
            marginLeft = 2;
          }
          else
          {
            decorator = "tabview-page-button-left-active";
            padding = useCSS ? [5, 10] : [ 6, 13 ];
            marginTop = states.firstTab ? 0 : -5;
            marginBottom = states.lastTab ? 0 : -5;
          }
        }
        else
        {
          if (states.barTop)
          {
            decorator = "tabview-page-button-top-inactive";
            padding = useCSS ? [3, 9] : [ 4, 10 ];
            marginTop = 4;
            marginLeft = states.firstTab ? 5 : 1;
            marginRight = 1;
          }
          else if (states.barBottom)
          {
            decorator = "tabview-page-button-bottom-inactive";
            padding = useCSS ? [3, 9] : [ 4, 10 ];
            marginBottom = 4;
            marginLeft = states.firstTab ? 5 : 1;
            marginRight = 1;
            marginTop = 3;
          }
          else if (states.barRight)
          {
            decorator = "tabview-page-button-right-inactive";
            padding = useCSS ? [3, 9] : [ 4, 10 ];
            marginRight = 5;
            marginTop = states.firstTab ? 5 : 1;
            marginBottom = 1;
            marginLeft = 3;
          }
          else
          {
            decorator = "tabview-page-button-left-inactive";
            padding = useCSS ? [3, 9] : [ 4, 10 ];
            marginLeft = 5;
            marginTop = states.firstTab ? 5 : 1;
            marginBottom = 1;
            marginRight = 1;
          }
        }

        if (decorator && useCSS) {
          decorator += "-css";
        }

        return {
          zIndex : states.checked ? 10 : 5,
          decorator : decorator,
          padding   : padding,
          marginTop : marginTop,
          marginBottom : marginBottom,
          marginLeft : marginLeft,
          marginRight : marginRight,
          textColor : states.disabled ? "text-disabled" :
            states.checked ? "text-active" : "text-inactive"
        };
      }
    },

    "tabview-page/button/label" :
    {
      alias : "label",

      style : function(states)
      {
        return {
          padding : [0, 1, 0, 1],
          margin : states.focused ? 0 : 1,
          decorator : states.focused ? "keyboard-focus" : undefined
        };
      }
    },

    "tabview-page/button/close-button" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          icon : "qx/icon/Tango/16/actions/window-close.png"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear");
        return {
          decorator : useCSS ? "toolbar-css" : "toolbar",
          spacing : 2
        };
      }
    },

    "toolbar/part" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-part",
          spacing : 2
        };
      }
    },

    "toolbar/part/container" :
    {
      style : function(states)
      {
        return {
          paddingLeft : 2,
          paddingRight : 2
        };
      }
    },

    "toolbar/part/handle" :
    {
      style : function(states)
      {
        return {
          source : "decoration/toolbar/toolbar-handle-knob.gif",
          marginLeft : 3,
          marginRight : 3
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator;
        if (
          states.pressed ||
          (states.checked && !states.hovered) ||
          (states.checked && states.disabled))
        {
          decorator = "toolbar-button-checked";
        } else if (states.hovered && !states.disabled) {
          decorator = "toolbar-button-hovered";
        }

        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.borderradius");
        if (useCSS && decorator) {
          decorator += "-css";
        }

        return {
          marginTop : 2,
          marginBottom : 2,
          padding : (states.pressed || states.checked || states.hovered) && !states.disabled
                    || (states.disabled && states.checked) ? 3 : 5,
          decorator : decorator
        };
      }
    },

    "toolbar-menubutton" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          showArrow : true
        };
      }
    },

    "toolbar-menubutton/arrow" :
    {
      alias : "image",
      include : "image",

      style : function(states)
      {
        return {
          source : "decoration/arrows/down-small.png"
        };
      }
    },

    "toolbar-splitbutton" :
    {
      style : function(states)
      {
        return {
          marginTop : 2,
          marginBottom : 2
        };
      }
    },

    "toolbar-splitbutton/button" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.png",
          marginTop : undefined,
          marginBottom : undefined
        };
      }
    },

    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        if (states.pressed || states.checked || (states.hovered && !states.disabled)) {
          var padding = 1;
        } else {
          var padding = 3;
        }

        return {
          padding : padding,
          icon : "decoration/arrows/down.png",
          marginTop : undefined,
          marginBottom : undefined
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-separator",
          margin    : 7
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree" : "list",

    "tree-item" :
    {
      style : function(states)
      {
        var decorator = states.selected ? "selected" : undefined;
        if (decorator && qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          padding    : [ 2, 6 ],
          textColor  : states.selected ? "text-selected" : undefined,
          decorator  : decorator
        };
      }
    },

    "tree-item/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          paddingRight : 5
        };
      }
    },

    "tree-item/label" : "label",

    "tree-item/open" :
    {
      include : "image",

      style : function(states)
      {
        var icon;
        if (states.selected && states.opened)
        {
          icon = "decoration/tree/open-selected.png";
        }
        else if (states.selected && !states.opened)
        {
          icon = "decoration/tree/closed-selected.png";
        }
        else if (states.opened)
        {
          icon = "decoration/tree/open.png";
        }
        else
        {
          icon = "decoration/tree/closed.png";
        }

        return {
          padding : [0, 5, 0, 2],
          source  : icon
        };
      }
    },

    "tree-folder" :
    {
      include : "tree-item",
      alias : "tree-item",

      style : function(states)
      {
        var icon, iconOpened;
        if (states.small) {
          icon = states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png";
          iconOpened = "icon/16/places/folder-open.png";
        } else if (states.large) {
          icon = states.opened ? "icon/32/places/folder-open.png" : "icon/32/places/folder.png";
          iconOpened = "icon/32/places/folder-open.png";
        } else {
          icon = states.opened ? "icon/22/places/folder-open.png" : "icon/22/places/folder.png";
          iconOpened = "icon/22/places/folder-open.png";
        }

        return {
          icon : icon,
          iconOpened : iconOpened
        };
      }
    },

    "tree-file" :
    {
      include : "tree-item",
      alias : "tree-item",

      style : function(states)
      {
        return {
          icon :
            states.small ? "icon/16/mimetypes/office-document.png" :
            states.large ? "icon/32/mimetypes/office-document.png" :
            "icon/22/mimetypes/office-document.png"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual" : "table",

    "treevirtual-folder" :
    {
      style : function(states)
      {
        return {
          icon : states.opened ?
            "icon/16/places/folder-open.png" :
            "icon/16/places/folder.png"
        };
      }
    },

    "treevirtual-file" :
    {
      include : "treevirtual-folder",
      alias : "treevirtual-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/office-document.png"
        };
      }
    },

    "treevirtual-line" :
    {
      style : function(states)
      {
        return {
          icon : "qx/static/blank.gif"
        };
      }
    },

    "treevirtual-contract" :
    {
      style : function(states)
      {
        return {
          icon : "decoration/tree/open.png",
          paddingLeft : 5,
          paddingTop : 2
        };
      }
    },

    "treevirtual-expand" :
    {
      style : function(states)
      {
        return {
          icon : "decoration/tree/closed.png",
          paddingLeft : 5,
          paddingTop : 2
        };
      }
    },

    "treevirtual-only-contract" : "treevirtual-contract",
    "treevirtual-only-expand" : "treevirtual-expand",
    "treevirtual-start-contract" : "treevirtual-contract",
    "treevirtual-start-expand" : "treevirtual-expand",
    "treevirtual-end-contract" : "treevirtual-contract",
    "treevirtual-end-expand" : "treevirtual-expand",
    "treevirtual-cross-contract" : "treevirtual-contract",
    "treevirtual-cross-expand" : "treevirtual-expand",

    "treevirtual-end" :
    {
      style : function(states)
      {
        return {
          icon : "qx/static/blank.gif"
        };
      }
    },

    "treevirtual-cross" :
    {
      style : function(states)
      {
        return {
          icon : "qx/static/blank.gif"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      TOOL TIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "background-tip",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 15, 5, 5, 5 ]
        };
      }
    },

    "tooltip/atom" : "atom",

    "tooltip-error" :
    {
      include : "tooltip",

      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.boxshadow");

        var shadow = "tooltip-error";
        if (useCSS) {
           shadow += "-css";
        }
        if (states.placementLeft) {
          shadow += "-left";
        }

        var decorator = "tooltip-error-arrow";
        if (states.placementLeft) {
          decorator = "tooltip-error-arrow-left";
          if (useCSS) {
            decorator += "-css";
          }
        }

        // padding
        if (useCSS) {
          if (states.placementLeft) {
            var padding = [9, 20, 3, 6];
          } else {
            var padding = [6, 6, 7, -8];
          }
        } else {
          if (states.placementLeft) {
            var padding = [6, 20, 3, 4];
          } else {
            var padding = [6, 10, 6, -10];
          }
        }

        // disable the right arrow in case of non CSS and alpah image loader
        if (
          !useCSS &&
          states.placementLeft &&
          qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("browser.documentmode") < 9
        ) {
          decorator = undefined;
          padding = [5, 10];
        }

        return {
          textColor: "text-selected",
          backgroundColor : undefined,
          placeMethod: "widget",
          offset: [0, 14, 0, 14],
          marginTop: -2,
          position: "right-top",
          showTimeout: 100,
          hideTimeout: 10000,
          shadow: shadow,
          decorator: decorator,
          font: "bold",
          padding: padding,
          maxWidth: 333
        };
      }
    },

    "tooltip-error/atom" : "atom",

    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");

        var decorator;
        var shadow;

        if (useCSS) {
          if (states.showStatusbar) {
            decorator = "window-incl-statusbar-css";
          } else {
            decorator = "window-css";
          }
        } else {
           shadow = "shadow-window";
        }
        return {
          decorator : decorator,
          shadow : shadow,
          contentPadding : [ 10, 10, 10, 10 ],
          margin : states.maximized ? 0 : [0, 5, 5, 0]
        };
      }
    },

    "window-resize-frame" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius");
        var decorator;

        if (useCSS) {
          if (states.showStatusbar) {
            decorator = "window-resize-frame-incl-statusbar-css";
          } else {
            decorator = "window-resize-frame-css";
          }
        } else {
           decorator = "main";
        }
        return {
          decorator : decorator
        };
      }
    },

    "window/pane" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");
        return {
          decorator : useCSS ? "window-pane-css" : "window"
        };
      }
    },

    "window/captionbar" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");

        var decorator = states.active ? "window-captionbar-active" : "window-captionbar-inactive";
        if (useCSS) {
          decorator += "-css";
        }

        return {
          decorator    : decorator,
          textColor    : states.active ? "window-caption-active-text" : "text-gray",
          minHeight    : 26,
          paddingRight : 2
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          margin : [ 5, 0, 3, 6 ]
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          alignY      : "middle",
          font        : "bold",
          marginLeft  : 6,
          marginRight : 12
        };
      }
    },

    "window/minimize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/minimize-active-hovered.png" :
                                                  "decoration/window/minimize-active.png" :
                                                  "decoration/window/minimize-inactive.png",
          margin : [ 4, 8, 2, 0 ]
        };
      }
    },

    "window/restore-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/restore-active-hovered.png" :
                                                  "decoration/window/restore-active.png" :
                                                  "decoration/window/restore-inactive.png",
          margin : [ 5, 8, 2, 0 ]
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/maximize-active-hovered.png" :
                                                  "decoration/window/maximize-active.png" :
                                                  "decoration/window/maximize-inactive.png",
          margin : [ 4, 8, 2, 0 ]
        };
      }
    },

    "window/close-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/close-active-hovered.png" :
                                                  "decoration/window/close-active.png" :
                                                  "decoration/window/close-inactive.png",
          margin : [ 4, 8, 2, 0 ]
        };
      }
    },

    "window/statusbar" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");
        return {
          padding   : [ 2, 6 ],
          decorator : useCSS ? "window-statusbar-css" : "window-statusbar",
          minHeight : 18
        };
      }
    },

    "window/statusbar-text" :
    {
      style : function(states)
      {
        return {
          font : "small"
        };
      }
    },







    /*
    ---------------------------------------------------------------------------
      IFRAME
    ---------------------------------------------------------------------------
    */

    "iframe" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.boxshadow") &&
          qx.core.Environment.get("css.borderradius") &&
          qx.core.Environment.get("css.gradient.linear");

        return {
          decorator : useCSS ? "pane-css" : "pane"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" :
    {
      style : function(states)
      {
        return {
          decorator : "splitpane"
        };
      }
    },

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 3 : undefined,
          height : states.vertical ? 3 : undefined,
          backgroundColor : "background-splitpane"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : states.horizontal ? "decoration/splitpane/knob-horizontal.png" : "decoration/splitpane/knob-vertical.png"
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 3 : undefined,
          height : states.vertical ? 3 : undefined,
          backgroundColor : "background-splitpane"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    "selectbox" : "button-frame",

    "selectbox/atom" : "atom",
    "selectbox/popup" : "popup",

    "selectbox/list" : {
      alias : "list"
    },

    "selectbox/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          source : "decoration/arrows/down.png",
          paddingLeft : 5
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          padding : 2,
          decorator : decorator,
          backgroundColor : "background-light"
        };
      }
    },

    "datechooser/navigation-bar" : {},

    "datechooser/nav-button"  :
    {
      include : "button-frame",
      alias : "button-frame",

      style : function(states)
      {
        var result = {
          padding : [ 2, 4 ],
          shadow : undefined
        };

        if (states.lastYear) {
          result.icon = "decoration/arrows/rewind.png";
          result.marginRight = 1;
        } else if (states.lastMonth) {
          result.icon = "decoration/arrows/left.png";
        } else if (states.nextYear) {
          result.icon = "decoration/arrows/forward.png";
          result.marginLeft = 1;
        } else if (states.nextMonth) {
          result.icon = "decoration/arrows/right.png";
        }

        return result;
      }
    },

    "datechooser/last-year-button-tooltip" : "tooltip",
    "datechooser/last-month-button-tooltip" : "tooltip",
    "datechooser/next-year-button-tooltip" : "tooltip",
    "datechooser/next-month-button-tooltip" : "tooltip",

    "datechooser/last-year-button" : "datechooser/nav-button",
    "datechooser/last-month-button" : "datechooser/nav-button",
    "datechooser/next-month-button" : "datechooser/nav-button",
    "datechooser/next-year-button" : "datechooser/nav-button",

    "datechooser/month-year-label" :
    {
      style : function(states)
      {
        return {
          font      : "bold",
          textAlign : "center",
          textColor: states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "datechooser/date-pane" :
    {
      style : function(states)
      {
        return {
          textColor: states.disabled ? "text-disabled" : undefined,
          marginTop : 2
        };
      }
    },

    "datechooser/weekday" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : states.weekend ? "text-light" : undefined,
          textAlign : "center",
          paddingTop : 2,
          backgroundColor : "background-medium"
        };
      }
    },

    "datechooser/week" :
    {
      style : function(states)
      {
        return {
          textAlign : "center",
          padding   : [ 2, 4 ],
          backgroundColor : "background-medium"
        };
      }
    },

    "datechooser/day" :
    {
      style : function(states)
      {
        var decorator = states.disabled ? undefined : states.selected ? "selected" : undefined;
        if (decorator && qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          textAlign : "center",
          decorator : decorator,
          textColor : states.disabled ? "text-disabled" : states.selected ? "text-selected" : states.otherMonth ? "text-light" : undefined,
          font      : states.today ? "bold" : undefined,
          padding   : [ 2, 4 ]
        };
      }
    },







    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combobox" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          decorator : decorator
        };
      }
    },

    "combobox/popup" : "popup",

    "combobox/list" : {
      alias : "list"
    },

    "combobox/button" :
    {
      include : "button-frame",
      alias   : "button-frame",

      style : function(states, superStyles)
      {
        var ret = {
          icon : "decoration/arrows/down.png",
          padding : [superStyles.padding[0], superStyles.padding[1] - 6],
          shadow : undefined,
          margin : undefined
        };

        if (states.selected) {
          ret.decorator = "button-focused";
        }

        return ret;
      }
    },

    "combobox/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

   "menu" :
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear") &&
          qx.core.Environment.get("css.boxshadow");

        var result =
        {
          decorator : useCSS ? "menu-css" : "menu",
          shadow : useCSS ? undefined : "shadow-popup",
          spacingX : 6,
          spacingY : 1,
          iconColumnWidth : 16,
          arrowColumnWidth : 4,
          placementModeY : states.submenu || states.contextmenu ? "best-fit" : "keep-align"
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offset = [-2, -3];
        }

        return result;
      }
    },

    "menu/slidebar" : "menu-slidebar",

    "menu-slidebar" : "widget",

    "menu-slidebar-button" :
    {
      style : function(states)
      {
        var decorator = states.hovered  ? "selected" : undefined;
        if (decorator && qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          decorator : decorator,
          padding : 7,
          center : true
        };
      }
    },

    "menu-slidebar/button-backward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : states.hovered ? "decoration/arrows/up-invert.png" : "decoration/arrows/up.png"
        };
      }
    },

    "menu-slidebar/button-forward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : states.hovered ? "decoration/arrows/down-invert.png" : "decoration/arrows/down.png"
        };
      }
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          height : 0,
          decorator : "menu-separator",
          margin    : [ 4, 2 ]
        };
      }
    },

    "menu-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = states.selected ? "selected" : undefined;
        if (decorator && qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          decorator : decorator,
          textColor : states.selected ? "text-selected" : undefined,
          padding   : [ 4, 6 ]
        };
      }
    },

    "menu-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          alignY : "middle"
        };
      }
    },

    "menu-button/label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          padding : 1
        };
      }
    },

    "menu-button/shortcut" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          marginLeft : 14,
          padding : 1
        };
      }
    },

    "menu-button/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          source : states.selected ? "decoration/arrows/right-invert.png" : "decoration/arrows/right.png",
          alignY : "middle"
        };
      }
    },

    "menu-checkbox" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? undefined :
            states.selected ? "decoration/menu/checkbox-invert.gif" :
              "decoration/menu/checkbox.gif"
        };
      }
    },

    "menu-radiobutton" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? undefined :
            states.selected ? "decoration/menu/radiobutton-invert.gif" :
              "decoration/menu/radiobutton.gif"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

   "menubar" :
   {
     style : function(states)
     {
       var useCSS = qx.core.Environment.get("css.gradient.linear");
       return {
         decorator : useCSS ? "menubar-css" : "menubar"
       };
     }
   },

   "menubar-button" :
   {
     alias : "atom",

     style : function(states)
     {
       var decorator = (states.pressed || states.hovered) && !states.disabled ? "selected" : undefined;
       if (decorator && qx.core.Environment.get("css.gradient.linear")) {
         decorator += "-css";
       }

       return {
         decorator : decorator,
         textColor : states.pressed || states.hovered ? "text-selected" : undefined,
         padding   : [ 3, 8 ]
       };
     }
   },



    /*
    ---------------------------------------------------------------------------
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" : "widget",
    "colorselector/control-bar" : "widget",
    "colorselector/control-pane": "widget",
    "colorselector/visual-pane" : "groupbox",
    "colorselector/preset-grid" : "widget",

    "colorselector/colorbucket":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          width : 16,
          height : 16
        };
      }
    },

    "colorselector/preset-field-set" : "groupbox",
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 20
        }
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 20
        }
      }
    },


    "colorselector/hex-field-composite" : "widget",
    "colorselector/hex-field" : "textfield",

    "colorselector/rgb-spinner-composite" : "widget",
    "colorselector/rgb-spinner-red" : "spinner",
    "colorselector/rgb-spinner-green" : "spinner",
    "colorselector/rgb-spinner-blue" : "spinner",

    "colorselector/hsb-spinner-composite" : "widget",
    "colorselector/hsb-spinner-hue" : "spinner",
    "colorselector/hsb-spinner-saturation" : "spinner",
    "colorselector/hsb-spinner-brightness" : "spinner",

    "colorselector/preview-content-old":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          width : 50,
          height : 10
        };
      }
    },

    "colorselector/preview-content-new":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          backgroundColor : "background-light",
          width : 50,
          height : 10
        };
      }
    },


    "colorselector/hue-saturation-field":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          margin : 5
        };
      }
    },

    "colorselector/brightness-field":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          margin : [5, 7]
        };
      }
    },

    "colorselector/hue-saturation-pane": "widget",
    "colorselector/hue-saturation-handle" : "widget",
    "colorselector/brightness-pane": "widget",
    "colorselector/brightness-handle" : "widget",




    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */

    "colorpopup" :
    {
      alias : "popup",
      include : "popup",

      style : function(states)
      {
        return {
          padding : 5,
          backgroundColor : "background-application"
        };
      }
    },

    "colorpopup/field":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          margin : 2,
          width : 14,
          height : 14,
          backgroundColor : "background-light"
        };
      }
    },

    "colorpopup/selector-button" : "button",
    "colorpopup/auto-button" : "button",
    "colorpopup/preview-pane" : "groupbox",

    "colorpopup/current-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginLeft : 4,
          decorator : "main",
          allowGrowX : true
        };
      }
    },

    "colorpopup/selected-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginRight : 4,
          decorator : "main",
          allowGrowX : true
        };
      }
    },

    "colorpopup/colorselector-okbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-ok.png"
        };
      }
    },

    "colorpopup/colorselector-cancelbutton":
   {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-cancel.png"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "table"
        };
      }
    },

    "table/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "table-statusbar",
          padding   : [ 0, 2 ]
        };
      }
    },

    "table/column-button" :
    {
      alias : "button-frame",

      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear");
        return {
          decorator : useCSS ? "table-scroller-header-css" : "table-scroller-header",
          padding   : 3,
          icon      : "decoration/table/select-column-order.png"
        };
      }
    },

    "table-column-reset-button" :
    {
      include : "menu-button",
      alias : "menu-button",

      style : function()
      {
        return {
          icon : "icon/16/actions/view-refresh.png"
        };
      }
    },

    "table-scroller" : "widget",

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller/header":
    {
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear");
        return {
          decorator : useCSS ? "table-scroller-header-css" : "table-scroller-header",
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "table-scroller/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "table-pane"
        };
      }
    },

    "table-scroller/focus-indicator" :
    {
      style : function(states)
      {
        return {
          decorator : "table-scroller-focus-indicator"
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "border-separator",
          width : 2
        };
      }
    },

    "table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          minWidth  : 13,
          minHeight : 20,
          padding   : states.hovered ? [ 3, 4, 2, 4 ] : [ 3, 4 ],
          decorator : states.hovered ? "table-header-cell-hovered" : "table-header-cell",
          sortIcon  : states.sorted ?
              (states.sortedAscending ? "decoration/table/ascending.png" : "decoration/table/descending.png")
              : undefined
        };
      }
    },

    "table-header-cell/label" :
    {
      style : function(states)
      {
        return {
          minWidth : 0,
          alignY : "middle",
          paddingRight : 5
        };
      }
    },

    "table-header-cell/sort-icon" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          alignX : "right",
          opacity : states.disabled ? 0.3 : 1
        };
      }
    },

    "table-header-cell/icon" :
    {
      style : function(states)
      {
        return {
          minWidth : 0,
          alignY : "middle",
          paddingRight : 5,
          opacity : states.disabled ? 0.3 : 1
        };
      }
    },

    "table-editor-textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding : [ 2, 2 ],
          backgroundColor : "background-light"
        };
      }
    },

    "table-editor-selectbox" :
    {
      include : "selectbox",
      alias : "selectbox",

      style : function(states)
      {
        return {
          padding : [ 0, 2 ],
          backgroundColor : "background-light"
        };
      }
    },

    "table-editor-combobox" :
    {
      include : "combobox",
      alias : "combobox",

      style : function(states)
      {
        return {
          decorator : undefined,
          backgroundColor : "background-light"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE
    ---------------------------------------------------------------------------
    */

    "progressive-table-header" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "progressive-table-header"
        };
      }
    },

    "progressive-table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {
        var useCSS = qx.core.Environment.get("css.gradient.linear");
        return {
          minWidth : 40,
          minHeight : 25,
          paddingLeft : 6,
          decorator : useCSS ? "progressive-table-header-cell-css" : "progressive-table-header-cell"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "bold",
          textColor : "text-selected",
          padding : [8, 12],
          decorator : "app-header"
        };
      }
    },

    "app-header-label": "label",


    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */

    "virtual-list" : "list",
    "virtual-list/row-layer" : "row-layer",

    "row-layer" : "widget",

    "group-item" :
    {
      include : "label",
      alias : "label",

      style : function(states)
      {
        return {
          padding : 4,
          decorator : qx.core.Environment.get("css.gradient.linear") ? "group-item-css" : "group-item",
          textColor : "groupitem-text",
          font: "bold"
        };
      }
    },

    "virtual-selectbox" : "selectbox",
    "virtual-selectbox/dropdown" : "popup",
    "virtual-selectbox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-combobox" : "combobox",
    "virtual-combobox/dropdown" : "popup",
    "virtual-combobox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 26
        };
      }
    },

    "virtual-tree-folder" : "tree-folder",
    "virtual-tree-file" : "tree-file",

    "column-layer" : "widget",

    "cell" :
    {
      style : function(states)
      {
        return {
          textColor: states.selected ? "text-selected" : "text-label",
          padding: [3, 6],
          font: "default"
        };
      }
    },

    "cell-string" : "cell",
    "cell-number" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          textAlign : "right"
        };
      }
    },
    "cell-image" : "cell",
    "cell-boolean" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          iconTrue : "decoration/table/boolean-true.png",
          iconFalse : "decoration/table/boolean-false.png"
        };
      }
    },
    "cell-atom" : "cell",
    "cell-date" : "cell",
    "cell-html" : "cell",



    /*
    ---------------------------------------------------------------------------
      HTMLAREA
    ---------------------------------------------------------------------------
    */

    "htmlarea" :
    {
      "include" : "widget",

      style : function(states)
      {
        return {
          backgroundColor : "htmlarea-background"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */
    "progressbar":
    {
      style: function(states) {
        return {
          decorator: "progressbar",
          padding: [1],
          backgroundColor: "progressbar-background",
          width : 200,
          height: 20
        }
      }
    },

    "progressbar/progress":
    {
      style: function(states)
      {
        var decorator = states.disabled ? "group-item" : "selected";
        if (qx.core.Environment.get("css.gradient.linear")) {
          decorator += "-css";
        }

        return {
          decorator: decorator
        }
      }
    }
  }
});
