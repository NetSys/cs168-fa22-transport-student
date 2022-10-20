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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Can be included for implementing {@link qx.ui.form.IModel}. It only contains
 * a nullable property named 'model' with a 'changeModel' event.
 */
qx.Mixin.define("qx.ui.form.MModelProperty",
{
  properties :
  {
    /**
     * Model property for storing additional information for the including
     * object. It can act as value property on form items for example.
     *
     * Be careful using that property as this is used for the
     * {@link qx.ui.form.MModelSelection} it has some restrictions:
     *
     * * Don't use equal models in one widget using the
     *     {@link qx.ui.form.MModelSelection}.
     *
     * * Avoid setting only some model properties if the widgets are added to
     *     a {@link qx.ui.form.MModelSelection} widge.
     *
     * Both restrictions result of the fact, that the set models are deputies
     * for their widget.
     */
    model :
    {
      nullable: true,
      event: "changeModel",
      dereference : true
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Each object which wants to store data representative for the real item
 * should implement this interface.
 */
qx.Interface.define("qx.ui.form.IModel",
{

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the model data changes */
    "changeModel" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Set the representative data for the item.
     *
     * @param value {var} The data.
     */
    setModel : function(value) {},


    /**
     * Returns the representative data for the item
     *
     * @return {var} The data.
     */
    getModel : function() {},


    /**
     * Sets the representative data to null.
     */
    resetModel : function() {}
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
 * A item for a list. Could be added to all List like widgets but also
 * to the {@link qx.ui.form.SelectBox} and {@link qx.ui.form.ComboBox}.
 */
qx.Class.define("qx.ui.form.ListItem",
{
  extend : qx.ui.basic.Atom,
  implement : [qx.ui.form.IModel],
  include : [qx.ui.form.MModelProperty],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   * @param model {String?null} The items value
   */
  construct : function(label, icon, model)
  {
    this.base(arguments, label, icon);

    if (model != null) {
      this.setModel(model);
    }

    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event"
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
      init : "listitem"
    }
  },


  members :
  {
    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      focused : true,
      hovered : true,
      selected : true,
      dragover : true
    },


    /**
     * Event handler for the mouse over event.
     */
    _onMouseOver : function() {
      this.addState("hovered");
    },


    /**
     * Event handler for the mouse out event.
     */
    _onMouseOut : function() {
      this.removeState("hovered");
    }
  },

  destruct : function() {
    this.removeListener("mouseover", this._onMouseOver, this);
    this.removeListener("mouseout", this._onMouseOut, this);
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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Generic selection manager to bring rich desktop like selection behavior
 * to widgets and low-level interactive controls.
 *
 * The selection handling supports both Shift and Ctrl/Meta modifies like
 * known from native applications.
 */
qx.Class.define("qx.ui.core.selection.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // {Map} Internal selection storage
    this.__selection = {};
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fires after the selection was modified. Contains the selection under the data property. */
    "changeSelection" : "qx.event.type.Data"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Selects the selection mode to use.
     *
     * * single: One or no element is selected
     * * multi: Multi items could be selected. Also allows empty selections.
     * * additive: Easy Web-2.0 selection mode. Allows multiple selections without modifier keys.
     * * one: If possible always exactly one item is selected
     */
    mode :
    {
      check : [ "single", "multi", "additive", "one" ],
      init : "single",
      apply : "_applyMode"
    },


    /**
     * Enable drag selection (multi selection of items through
     * dragging the mouse in pressed states).
     *
     * Only possible for the modes <code>multi</code> and <code>additive</code>
     */
    drag :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Enable quick selection mode, where no click is needed to change the selection.
     *
     * Only possible for the modes <code>single</code> and <code>one</code>.
     */
    quick :
    {
      check : "Boolean",
      init : false
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __scrollStepX : 0,
    __scrollStepY : 0,
    __scrollTimer : null,
    __frameScroll : null,
    __lastRelX : null,
    __lastRelY : null,
    __frameLocation : null,
    __dragStartX : null,
    __dragStartY : null,
    __inCapture : null,
    __mouseX : null,
    __mouseY : null,
    __moveDirectionX : null,
    __moveDirectionY : null,
    __selectionModified : null,
    __selectionContext : null,
    __leadItem : null,
    __selection : null,
    __anchorItem : null,
    __mouseDownOnSelected : null,

    // A flag that signals an user interaction, which means the selection change
    // was triggered by mouse or keyboard [BUG #3344]
    _userInteraction : false,

    __oldScrollTop : null,

    /*
    ---------------------------------------------------------------------------
      USER APIS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the selection context. One of <code>click</code>,
     * <code>quick</code>, <code>drag</code> or <code>key</code> or
     * <code>null</code>.
     *
     * @return {String} One of <code>click</code>, <code>quick</code>,
     *    <code>drag</code> or <code>key</code> or <code>null</code>
     */
    getSelectionContext : function() {
      return this.__selectionContext;
    },


    /**
     * Selects all items of the managed object.
     *
     * @return {void}
     */
    selectAll : function()
    {
      var mode = this.getMode();
      if (mode == "single" || mode == "one") {
        throw new Error("Can not select all items in selection mode: " + mode);
      }

      this._selectAllItems();
      this._fireChange();
    },


    /**
     * Selects the given item. Replaces current selection
     * completely with the new item.
     *
     * Use {@link #addItem} instead if you want to add new
     * items to an existing selection.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    selectItem : function(item)
    {
      this._setSelectedItem(item);

      var mode = this.getMode();
      if (mode !== "single" && mode !== "one")
      {
        this._setLeadItem(item);
        this._setAnchorItem(item);
      }

      this._scrollItemIntoView(item);
      this._fireChange();
    },


    /**
     * Adds the given item to the existing selection.
     *
     * Use {@link #selectItem} instead if you want to replace
     * the current selection.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    addItem : function(item)
    {
      var mode = this.getMode();
      if (mode === "single" || mode === "one") {
        this._setSelectedItem(item);
      }
      else
      {
        if (this._getAnchorItem() == null) {
          this._setAnchorItem(item);
        }

        this._setLeadItem(item);
        this._addToSelection(item);
      }

      this._scrollItemIntoView(item);
      this._fireChange();
    },


    /**
     * Removes the given item from the selection.
     *
     * Use {@link #clearSelection} when you want to clear
     * the whole selection at once.
     *
     * @param item {Object} Any valid item
     * @return {void}
     */
    removeItem : function(item)
    {
      this._removeFromSelection(item);

      if (this.getMode() === "one" && this.isSelectionEmpty())
      {
        var selected = this._applyDefaultSelection();

        // Do not fire any event in this case.
        if (selected == item) {
          return;
        }
      }

      if (this.getLeadItem() == item) {
        this._setLeadItem(null);
      }

      if (this._getAnchorItem() == item) {
        this._setAnchorItem(null);
      }

      this._fireChange();
    },


    /**
     * Selects an item range between two given items.
     *
     * @param begin {Object} Item to start with
     * @param end {Object} Item to end at
     * @return {void}
     */
    selectItemRange : function(begin, end)
    {
      var mode = this.getMode();
      if (mode == "single" || mode == "one") {
        throw new Error("Can not select multiple items in selection mode: " + mode);
      }

      this._selectItemRange(begin, end);

      this._setAnchorItem(begin);

      this._setLeadItem(end);
      this._scrollItemIntoView(end);

      this._fireChange();
    },


    /**
     * Clears the whole selection at once. Also
     * resets the lead and anchor items and their
     * styles.
     *
     * @return {void}
     */
    clearSelection : function()
    {
      if (this.getMode() == "one")
      {
        var selected = this._applyDefaultSelection(true);
        if (selected != null) {
          return;
        }
      }

      this._clearSelection();
      this._setLeadItem(null);
      this._setAnchorItem(null);

      this._fireChange();
    },


    /**
     * Replaces current selection with given array of items.
     *
     * Please note that in single selection scenarios it is more
     * efficient to directly use {@link #selectItem}.
     *
     * @param items {Array} Items to select
     */
    replaceSelection : function(items)
    {
      var mode = this.getMode();
      if (mode == "one" || mode === "single")
      {
        if (items.length > 1)   {
          throw new Error("Could not select more than one items in mode: " + mode + "!");
        }

        if (items.length == 1) {
          this.selectItem(items[0]);
        } else {
          this.clearSelection();
        }
        return;
      }
      else
      {
        this._replaceMultiSelection(items);
      }
    },


    /**
     * Get the selected item. This method does only work in <code>single</code>
     * selection mode.
     *
     * @return {Object} The selected item.
     */
    getSelectedItem : function()
    {
      var mode = this.getMode();
      if (mode === "single" || mode === "one")
      {
        var result = this._getSelectedItem();
        return result != undefined ? result : null;
      }

      throw new Error("The method getSelectedItem() is only supported in 'single' and 'one' selection mode!");
    },


    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {Object[]} List of items.
     */
    getSelection : function() {
      return qx.lang.Object.getValues(this.__selection);
    },


    /**
     * Returns the selection sorted by the index in the
     * container of the selection (the assigned widget)
     *
     * @return {Object[]} Sorted list of items
     */
    getSortedSelection : function()
    {
      var children = this.getSelectables();
      var sel = qx.lang.Object.getValues(this.__selection);

      sel.sort(function(a, b) {
        return children.indexOf(a) - children.indexOf(b);
      });

      return sel;
    },


    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {var} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    isItemSelected : function(item)
    {
      var hash = this._selectableToHashCode(item);
      return this.__selection[hash] !== undefined;
    },


    /**
     * Whether the selection is empty
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return qx.lang.Object.isEmpty(this.__selection);
    },


    /**
     * Invert the selection. Select the non selected and deselect the selected.
     */
    invertSelection: function() {
      var mode = this.getMode();
      if (mode === "single" || mode === "one") {
        throw new Error("The method invertSelection() is only supported in 'multi' and 'additive' selection mode!");
      }

      var selectables = this.getSelectables();
      for (var i = 0; i < selectables.length; i++)
      {
        this._toggleInSelection(selectables[i]);
      }

      this._fireChange();
    },



    /*
    ---------------------------------------------------------------------------
      LEAD/ANCHOR SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the lead item. Generally the item which was last modified
     * by the user (clicked on etc.)
     *
     * @param value {Object} Any valid item or <code>null</code>
     * @return {void}
     */
    _setLeadItem : function(value)
    {
      var old = this.__leadItem;

      if (old !== null) {
        this._styleSelectable(old, "lead", false);
      }

      if (value !== null) {
        this._styleSelectable(value, "lead", true);
      }

      this.__leadItem = value;
    },


    /**
     * Returns the current lead item. Generally the item which was last modified
     * by the user (clicked on etc.)
     *
     * @return {Object} The lead item or <code>null</code>
     */
    getLeadItem : function() {
      return this.__leadItem !== null ? this.__leadItem : null;
    },


    /**
     * Sets the anchor item. This is the item which is the starting
     * point for all range selections. Normally this is the item which was
     * clicked on the last time without any modifier keys pressed.
     *
     * @param value {Object} Any valid item or <code>null</code>
     * @return {void}
     */
    _setAnchorItem : function(value)
    {
      var old = this.__anchorItem;

      if (old != null) {
        this._styleSelectable(old, "anchor", false);
      }

      if (value != null) {
        this._styleSelectable(value, "anchor", true);
      }

      this.__anchorItem = value;
    },


    /**
     * Returns the current anchor item. This is the item which is the starting
     * point for all range selections. Normally this is the item which was
     * clicked on the last time without any modifier keys pressed.
     *
     * @return {Object} The anchor item or <code>null</code>
     */
    _getAnchorItem : function() {
      return this.__anchorItem !== null ? this.__anchorItem : null;
    },





    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given item is selectable.
     *
     * @param item {var} Any item
     * @return {Boolean} <code>true</code> when the item is selectable
     */
    _isSelectable : function(item) {
      throw new Error("Abstract method call: _isSelectable()");
    },


    /**
     * Finds the selectable instance from a mouse event
     *
     * @param event {qx.event.type.Mouse} The mouse event
     * @return {Object|null} The resulting selectable
     */
    _getSelectableFromMouseEvent : function(event)
    {
      var target = event.getTarget();
      // check for target (may be null when leaving the viewport) [BUG #4378]
      if (target && this._isSelectable(target)) {
        return target;
      }
      return null;
    },


    /**
     * Returns an unique hashcode for the given item.
     *
     * @param item {var} Any item
     * @return {String} A valid hashcode
     */
    _selectableToHashCode : function(item) {
      throw new Error("Abstract method call: _selectableToHashCode()");
    },


    /**
     * Updates the style (appearance) of the given item.
     *
     * @param item {var} Item to modify
     * @param type {String} Any of <code>selected</code>, <code>anchor</code> or <code>lead</code>
     * @param enabled {Boolean} Whether the given style should be added or removed.
     * @return {void}
     */
    _styleSelectable : function(item, type, enabled) {
      throw new Error("Abstract method call: _styleSelectable()");
    },


    /**
     * Enables capturing of the container.
     *
     * @return {void}
     */
    _capture : function() {
      throw new Error("Abstract method call: _capture()");
    },


    /**
     * Releases capturing of the container
     *
     * @return {void}
     */
    _releaseCapture : function() {
      throw new Error("Abstract method call: _releaseCapture()");
    },






    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the location of the container
     *
     * @return {Map} Map with the keys <code>top</code>, <code>right</code>,
     *    <code>bottom</code> and <code>left</code>.
     */
    _getLocation : function() {
      throw new Error("Abstract method call: _getLocation()");
    },


    /**
     * Returns the dimension of the container (available scrolling space).
     *
     * @return {Map} Map with the keys <code>width</code> and <code>height</code>.
     */
    _getDimension : function() {
      throw new Error("Abstract method call: _getDimension()");
    },


    /**
     * Returns the relative (to the container) horizontal location of the given item.
     *
     * @param item {var} Any item
     * @return {Map} A map with the keys <code>left</code> and <code>right</code>.
     */
    _getSelectableLocationX : function(item) {
      throw new Error("Abstract method call: _getSelectableLocationX()");
    },


    /**
     * Returns the relative (to the container) horizontal location of the given item.
     *
     * @param item {var} Any item
     * @return {Map} A map with the keys <code>top</code> and <code>bottom</code>.
     */
    _getSelectableLocationY : function(item) {
      throw new Error("Abstract method call: _getSelectableLocationY()");
    },






    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the scroll position of the container.
     *
     * @return {Map} Map with the keys <code>left</code> and <code>top</code>.
     */
    _getScroll : function() {
      throw new Error("Abstract method call: _getScroll()");
    },


    /**
     * Scrolls by the given offset
     *
     * @param xoff {Integer} Horizontal offset to scroll by
     * @param yoff {Integer} Vertical offset to scroll by
     * @return {void}
     */
    _scrollBy : function(xoff, yoff) {
      throw new Error("Abstract method call: _scrollBy()");
    },


    /**
     * Scrolls the given item into the view (make it visible)
     *
     * @param item {var} Any item
     * @return {void}
     */
    _scrollItemIntoView : function(item) {
      throw new Error("Abstract method call: _scrollItemIntoView()");
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns all selectable items of the container.
     *
     * @param all {boolean} true for all selectables, false for the
      *   selectables the user can interactively select
     * @return {Array} A list of items
     */
    getSelectables : function(all) {
      throw new Error("Abstract method call: getSelectables()");
    },


    /**
     * Returns all selectable items between the two given items.
     *
     * The items could be given in any order.
     *
     * @param item1 {var} First item
     * @param item2 {var} Second item
     * @return {Array} List of items
     */
    _getSelectableRange : function(item1, item2) {
      throw new Error("Abstract method call: _getSelectableRange()");
    },


    /**
     * Returns the first selectable item.
     *
     * @return {var} The first selectable item
     */
    _getFirstSelectable : function() {
      throw new Error("Abstract method call: _getFirstSelectable()");
    },


    /**
     * Returns the last selectable item.
     *
     * @return {var} The last selectable item
     */
    _getLastSelectable : function() {
      throw new Error("Abstract method call: _getLastSelectable()");
    },


    /**
     * Returns a selectable item which is related to the given
     * <code>item</code> through the value of <code>relation</code>.
     *
     * @param item {var} Any item
     * @param relation {String} A valid relation: <code>above</code>,
     *    <code>right</code>, <code>under</code> or <code>left</code>
     * @return {var} The related item
     */
    _getRelatedSelectable : function(item, relation) {
      throw new Error("Abstract method call: _getRelatedSelectable()");
    },


    /**
     * Returns the item which should be selected on pageUp/pageDown.
     *
     * May also scroll to the needed position.
     *
     * @param lead {var} The current lead item
     * @param up {Boolean?false} Which page key was pressed:
     *   <code>up</code> or <code>down</code>.
     * @return {void}
     */
    _getPage : function(lead, up) {
      throw new Error("Abstract method call: _getPage()");
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMode : function(value, old)
    {
      this._setLeadItem(null);
      this._setAnchorItem(null);

      this._clearSelection();

      // Mode "one" requires one selected item
      if (value === "one") {
        this._applyDefaultSelection(true);
      }

      this._fireChange();
    },






    /*
    ---------------------------------------------------------------------------
      MOUSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * This method should be connected to the <code>mouseover</code> event
     * of the managed object.
     *
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseOver : function(event)
    {
      // All browsers (except Opera) fire a native "mouseover" event when a scroll appears
      // by keyboard interaction. We have to ignore the event to avoid a selection for
      // "mouseover" (quick selection). For more details see [BUG #4225]
      if(this.__oldScrollTop != null &&
         this.__oldScrollTop != this._getScroll().top)
      {
        this.__oldScrollTop = null;
        return;
      }

      // this is a method invoked by an user interaction, so be careful to
      // set / clear the mark this._userInteraction [BUG #3344]
      this._userInteraction = true;

      if (!this.getQuick()) {
        this._userInteraction = false;
        return;
      }

      var mode = this.getMode();
      if (mode !== "one" && mode !== "single") {
        this._userInteraction = false;
        return;
      }

      var item = this._getSelectableFromMouseEvent(event);
      if (item === null) {
        this._userInteraction = false;
        return;
      }

      this._setSelectedItem(item);

      // Be sure that item is in view
      // This does not feel good when mouseover is used
      // this._scrollItemIntoView(item);

      // Fire change event as needed
      this._fireChange("quick");

      this._userInteraction = false;
    },


    /**
     * This method should be connected to the <code>mousedown</code> event
     * of the managed object.
     *
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseDown : function(event)
    {
      // this is a method invoked by an user interaction, so be careful to
      // set / clear the mark this._userInteraction [BUG #3344]
      this._userInteraction = true;

      var item = this._getSelectableFromMouseEvent(event);
      if (item === null) {
        this._userInteraction = false;
        return;
      }

      // Read in keyboard modifiers
      var isCtrlPressed = event.isCtrlPressed() ||
        (qx.core.Environment.get("os.name") == "osx" && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();

      // Clicking on selected items deselect on mouseup, not on mousedown
      if (this.isItemSelected(item) && !isShiftPressed && !isCtrlPressed && !this.getDrag())
      {
        this.__mouseDownOnSelected = item;
        this._userInteraction = false;
        return;
      }
      else
      {
        this.__mouseDownOnSelected = null;
      }

      // Be sure that item is in view
      this._scrollItemIntoView(item);

      // Action depends on selected mode
      switch(this.getMode())
      {
        case "single":
        case "one":
          this._setSelectedItem(item);
          break;

        case "additive":
          this._setLeadItem(item);
          this._setAnchorItem(item);
          this._toggleInSelection(item);
          break;

        case "multi":
          // Update lead item
          this._setLeadItem(item);

          // Create/Update range selection
          if (isShiftPressed)
          {
            var anchor = this._getAnchorItem();
            if (anchor === null)
            {
              anchor = this._getFirstSelectable();
              this._setAnchorItem(anchor);
            }

            this._selectItemRange(anchor, item, isCtrlPressed);
          }

          // Toggle in selection
          else if (isCtrlPressed)
          {
            this._setAnchorItem(item);
            this._toggleInSelection(item);
          }

          // Replace current selection
          else
          {
            this._setAnchorItem(item);
            this._setSelectedItem(item);
          }

          break;
      }


      // Drag selection
      var mode = this.getMode();
      if (
        this.getDrag() &&
        mode !== "single" &&
        mode !== "one" &&
        !isShiftPressed &&
        !isCtrlPressed
      )
      {
        // Cache location/scroll data
        this.__frameLocation = this._getLocation();
        this.__frameScroll = this._getScroll();

        // Store position at start
        this.__dragStartX = event.getDocumentLeft() + this.__frameScroll.left;
        this.__dragStartY = event.getDocumentTop() + this.__frameScroll.top;

        // Switch to capture mode
        this.__inCapture = true;
        this._capture();
      }


      // Fire change event as needed
      this._fireChange("click");

      this._userInteraction = false;
    },


    /**
     * This method should be connected to the <code>mouseup</code> event
     * of the managed object.
     *
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseUp : function(event)
    {
      // this is a method invoked by an user interaction, so be careful to
      // set / clear the mark this._userInteraction [BUG #3344]
      this._userInteraction = true;

      // Read in keyboard modifiers
      var isCtrlPressed = event.isCtrlPressed() ||
        (qx.core.Environment.get("os.name") == "osx" && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();

      if (!isCtrlPressed && !isShiftPressed && this.__mouseDownOnSelected != null)
      {
        var item = this._getSelectableFromMouseEvent(event);
        if (item === null || !this.isItemSelected(item)) {
          this._userInteraction = false;
          return;
        }

        var mode = this.getMode();
        if (mode === "additive")
        {
          // Remove item from selection
          this._removeFromSelection(item);
        }
        else
        {
          // Replace selection
          this._setSelectedItem(item);

          if (this.getMode() === "multi")
          {
            this._setLeadItem(item);
            this._setAnchorItem(item);
          }
        }
        this._userInteraction = false;
      }

      // Cleanup operation
      this._cleanup();
    },


    /**
     * This method should be connected to the <code>losecapture</code> event
     * of the managed object.
     *
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleLoseCapture : function(event) {
      this._cleanup();
    },


    /**
     * This method should be connected to the <code>mousemove</code> event
     * of the managed object.
     *
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseMove : function(event)
    {
      // Only relevant when capturing is enabled
      if (!this.__inCapture) {
        return;
      }


      // Update mouse position cache
      this.__mouseX = event.getDocumentLeft();
      this.__mouseY = event.getDocumentTop();

      // this is a method invoked by an user interaction, so be careful to
      // set / clear the mark this._userInteraction [BUG #3344]
      this._userInteraction = true;

      // Detect move directions
      var dragX = this.__mouseX + this.__frameScroll.left;
      if (dragX > this.__dragStartX) {
        this.__moveDirectionX = 1;
      } else if (dragX < this.__dragStartX) {
        this.__moveDirectionX = -1;
      } else {
        this.__moveDirectionX = 0;
      }

      var dragY = this.__mouseY + this.__frameScroll.top;
      if (dragY > this.__dragStartY) {
        this.__moveDirectionY = 1;
      } else if (dragY < this.__dragStartY) {
        this.__moveDirectionY = -1;
      } else {
        this.__moveDirectionY = 0;
      }


      // Update scroll steps
      var location = this.__frameLocation;

      if (this.__mouseX < location.left) {
        this.__scrollStepX = this.__mouseX - location.left;
      } else if (this.__mouseX > location.right) {
        this.__scrollStepX = this.__mouseX - location.right;
      } else {
        this.__scrollStepX = 0;
      }

      if (this.__mouseY < location.top) {
        this.__scrollStepY = this.__mouseY - location.top;
      } else if (this.__mouseY > location.bottom) {
        this.__scrollStepY = this.__mouseY - location.bottom;
      } else {
        this.__scrollStepY = 0;
      }


      // Dynamically create required timer instance
      if (!this.__scrollTimer)
      {
        this.__scrollTimer = new qx.event.Timer(100);
        this.__scrollTimer.addListener("interval", this._onInterval, this);
      }


      // Start interval
      this.__scrollTimer.start();


      // Auto select based on new cursor position
      this._autoSelect();

      event.stopPropagation();
      this._userInteraction = false;
    },


    /**
     * This method should be connected to the <code>addItem</code> event
     * of the managed object.
     *
     * @param e {qx.event.type.Data} The event object
     * @return {void}
     */
    handleAddItem : function(e)
    {
      var item = e.getData();
      if (this.getMode() === "one" && this.isSelectionEmpty()) {
        this.addItem(item);
      }
    },


    /**
     * This method should be connected to the <code>removeItem</code> event
     * of the managed object.
     *
     * @param e {qx.event.type.Data} The event object
     * @return {void}
     */
    handleRemoveItem : function(e) {
      this.removeItem(e.getData());
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE SUPPORT INTERNALS
    ---------------------------------------------------------------------------
    */

    /**
     * Stops all timers, release capture etc. to cleanup drag selection
     */
    _cleanup : function()
    {
      if (!this.getDrag() && this.__inCapture) {
        return;
      }

      // Fire change event if needed
      if (this.__selectionModified) {
        this._fireChange("click");
      }

      // Remove flags
      delete this.__inCapture;
      delete this.__lastRelX;
      delete this.__lastRelY;

      // Stop capturing
      this._releaseCapture();

      // Stop timer
      if (this.__scrollTimer) {
        this.__scrollTimer.stop();
      }
    },


    /**
     * Event listener for timer used by drag selection
     *
     * @param e {qx.event.type.Event} Timer event
     */
    _onInterval : function(e)
    {
      // Scroll by defined block size
      this._scrollBy(this.__scrollStepX, this.__scrollStepY);

      // TODO: Optimization: Detect real scroll changes first?

      // Update scroll cache
      this.__frameScroll = this._getScroll();

      // Auto select based on new scroll position and cursor
      this._autoSelect();
    },


    /**
     * Automatically selects items based on the mouse movement during a drag selection
     */
    _autoSelect : function()
    {
      var inner = this._getDimension();

      // Get current relative Y position and compare it with previous one
      var relX = Math.max(0, Math.min(this.__mouseX - this.__frameLocation.left, inner.width)) + this.__frameScroll.left;
      var relY = Math.max(0, Math.min(this.__mouseY - this.__frameLocation.top, inner.height)) + this.__frameScroll.top;

      // Compare old and new relative coordinates (for performance reasons)
      if (this.__lastRelX === relX && this.__lastRelY === relY) {
        return;
      }
      this.__lastRelX = relX;
      this.__lastRelY = relY;

      // Cache anchor
      var anchor = this._getAnchorItem();
      var lead = anchor;


      // Process X-coordinate
      var moveX = this.__moveDirectionX;
      var nextX, locationX;

      while (moveX !== 0)
      {
        // Find next item to process depending on current scroll direction
        nextX = moveX > 0 ?
          this._getRelatedSelectable(lead, "right") :
          this._getRelatedSelectable(lead, "left");

        // May be null (e.g. first/last item)
        if (nextX !== null)
        {
          locationX = this._getSelectableLocationX(nextX);

          // Continue when the item is in the visible area
          if (
            (moveX > 0 && locationX.left <= relX) ||
            (moveX < 0 && locationX.right >= relX)
          )
          {
            lead = nextX;
            continue;
          }
        }

        // Otherwise break
        break;
      }


      // Process Y-coordinate
      var moveY = this.__moveDirectionY;
      var nextY, locationY;

      while (moveY !== 0)
      {
        // Find next item to process depending on current scroll direction
        nextY = moveY > 0 ?
          this._getRelatedSelectable(lead, "under") :
          this._getRelatedSelectable(lead, "above");

        // May be null (e.g. first/last item)
        if (nextY !== null)
        {
          locationY = this._getSelectableLocationY(nextY);

          // Continue when the item is in the visible area
          if (
            (moveY > 0 && locationY.top <= relY) ||
            (moveY < 0 && locationY.bottom >= relY)
          )
          {
            lead = nextY;
            continue;
          }
        }

        // Otherwise break
        break;
      }


      // Differenciate between the two supported modes
      var mode = this.getMode();
      if (mode === "multi")
      {
        // Replace current selection with new range
        this._selectItemRange(anchor, lead);
      }
      else if (mode === "additive")
      {
        // Behavior depends on the fact whether the
        // anchor item is selected or not
        if (this.isItemSelected(anchor)) {
          this._selectItemRange(anchor, lead, true);
        } else {
          this._deselectItemRange(anchor, lead);
        }

        // Improve performance. This mode does not rely
        // on full ranges as it always extend the old
        // selection/deselection.
        this._setAnchorItem(lead);
      }


      // Fire change event as needed
      this._fireChange("drag");
    },






    /*
    ---------------------------------------------------------------------------
      KEYBOARD SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * {Map} All supported navigation keys
     *
     * @lint ignoreReferenceField(__navigationKeys)
     */
    __navigationKeys :
    {
      Home : 1,
      Down : 1 ,
      Right : 1,
      PageDown : 1,
      End : 1,
      Up : 1,
      Left : 1,
      PageUp : 1
    },


    /**
     * This method should be connected to the <code>keypress</code> event
     * of the managed object.
     *
     * @param event {qx.event.type.KeySequence} A valid key sequence event
     * @return {void}
     */
    handleKeyPress : function(event)
    {
      // this is a method invoked by an user interaction, so be careful to
      // set / clear the mark this._userInteraction [BUG #3344]
      this._userInteraction = true;

      var current, next;
      var key = event.getKeyIdentifier();
      var mode = this.getMode();

      // Support both control keys on Mac
      var isCtrlPressed = event.isCtrlPressed() ||
        (qx.core.Environment.get("os.name") == "osx" && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();

      var consumed = false;

      if (key === "A" && isCtrlPressed)
      {
        if (mode !== "single" && mode !== "one")
        {
          this._selectAllItems();
          consumed = true;
        }
      }
      else if (key === "Escape")
      {
        if (mode !== "single" && mode !== "one")
        {
          this._clearSelection();
          consumed = true;
        }
      }
      else if (key === "Space")
      {
        var lead = this.getLeadItem();
        if (lead != null && !isShiftPressed)
        {
          if (isCtrlPressed || mode === "additive") {
            this._toggleInSelection(lead);
          } else {
            this._setSelectedItem(lead);
          }
          consumed = true;
        }
      }
      else if (this.__navigationKeys[key])
      {
        consumed = true;
        if (mode === "single" || mode == "one") {
          current = this._getSelectedItem();
        } else {
          current = this.getLeadItem();
        }

        if (current !== null)
        {
          switch(key)
          {
            case "Home":
              next = this._getFirstSelectable();
              break;

            case "End":
              next = this._getLastSelectable();
              break;

            case "Up":
              next = this._getRelatedSelectable(current, "above");
              break;

            case "Down":
              next = this._getRelatedSelectable(current, "under");
              break;

            case "Left":
              next = this._getRelatedSelectable(current, "left");
              break;

            case "Right":
              next = this._getRelatedSelectable(current, "right");
              break;

            case "PageUp":
              next = this._getPage(current, true);
              break;

            case "PageDown":
              next = this._getPage(current, false);
              break;
          }
        }
        else
        {
          switch(key)
          {
            case "Home":
            case "Down":
            case "Right":
            case "PageDown":
              next = this._getFirstSelectable();
              break;

            case "End":
            case "Up":
            case "Left":
            case "PageUp":
              next = this._getLastSelectable();
              break;
          }
        }

        // Process result
        if (next !== null)
        {
          switch(mode)
          {
            case "single":
            case "one":
              this._setSelectedItem(next);
              break;

            case "additive":
              this._setLeadItem(next);
              break;

            case "multi":
              if (isShiftPressed)
              {
                var anchor = this._getAnchorItem();
                if (anchor === null) {
                  this._setAnchorItem(anchor = this._getFirstSelectable());
                }

                this._setLeadItem(next);
                this._selectItemRange(anchor, next, isCtrlPressed);
              }
              else
              {
                this._setAnchorItem(next);
                this._setLeadItem(next);

                if (!isCtrlPressed) {
                  this._setSelectedItem(next);
                }
              }

              break;
          }

          this.__oldScrollTop = this._getScroll().top;
          this._scrollItemIntoView(next);
        }
      }


      if (consumed)
      {
        // Stop processed events
        event.stop();

        // Fire change event as needed
        this._fireChange("key");
      }
      this._userInteraction = false;
    },






    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR ITEM RANGES
    ---------------------------------------------------------------------------
    */

    /**
     * Adds all items to the selection
     */
    _selectAllItems : function()
    {
      var range = this.getSelectables();
      for (var i=0, l=range.length; i<l; i++) {
        this._addToSelection(range[i]);
      }
    },


    /**
     * Clears current selection
     */
    _clearSelection : function()
    {
      var selection = this.__selection;
      for (var hash in selection) {
        this._removeFromSelection(selection[hash]);
      }
      this.__selection = {};
    },


    /**
     * Select a range from <code>item1</code> to <code>item2</code>.
     *
     * @param item1 {Object} Start with this item
     * @param item2 {Object} End with this item
     * @param extend {Boolean?false} Whether the current
     *    selection should be replaced or extended.
     */
    _selectItemRange : function(item1, item2, extend)
    {
      var range = this._getSelectableRange(item1, item2);

      // Remove items which are not in the detected range
      if (!extend)
      {
        var selected = this.__selection;
        var mapped = this.__rangeToMap(range);

        for (var hash in selected)
        {
          if (!mapped[hash]) {
            this._removeFromSelection(selected[hash]);
          }
        }
      }

      // Add new items to the selection
      for (var i=0, l=range.length; i<l; i++) {
        this._addToSelection(range[i]);
      }
    },


    /**
     * Deselect all items between <code>item1</code> and <code>item2</code>.
     *
     * @param item1 {Object} Start with this item
     * @param item2 {Object} End with this item
     */
    _deselectItemRange : function(item1, item2)
    {
      var range = this._getSelectableRange(item1, item2);
      for (var i=0, l=range.length; i<l; i++) {
        this._removeFromSelection(range[i]);
      }
    },


    /**
     * Internal method to convert a range to a map of hash
     * codes for faster lookup during selection compare routines.
     *
     * @param range {Array} List of selectable items
     */
    __rangeToMap : function(range)
    {
      var mapped = {};
      var item;

      for (var i=0, l=range.length; i<l; i++)
      {
        item = range[i];
        mapped[this._selectableToHashCode(item)] = item;
      }

      return mapped;
    },






    /*
    ---------------------------------------------------------------------------
      SINGLE ITEM QUERY AND MODIFICATION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the first selected item. Only makes sense
     * when using manager in single selection mode.
     *
     * @return {var} The selected item (or <code>null</code>)
     */
    _getSelectedItem : function()
    {
      for (var hash in this.__selection) {
        return this.__selection[hash];
      }

      return null;
    },


    /**
     * Replace current selection with given item.
     *
     * @param item {var} Any valid selectable item
     * @return {void}
     */
    _setSelectedItem : function(item)
    {
      if (this._isSelectable(item))
      {
        // If already selected try to find out if this is the only item
        var current = this.__selection;
        var hash = this._selectableToHashCode(item);

        if (!current[hash] || qx.lang.Object.hasMinLength(current, 2))
        {
          this._clearSelection();
          this._addToSelection(item);
        }
      }
    },







    /*
    ---------------------------------------------------------------------------
      MODIFY ITEM SELECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Adds an item to the current selection.
     *
     * @param item {Object} Any item
     */
    _addToSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (this.__selection[hash] == null && this._isSelectable(item))
      {
        this.__selection[hash] = item;
        this._styleSelectable(item, "selected", true);

        this.__selectionModified = true;
      }
    },


    /**
     * Toggles the item e.g. remove it when already selected
     * or select it when currently not.
     *
     * @param item {Object} Any item
     */
    _toggleInSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (this.__selection[hash] == null)
      {
        this.__selection[hash] = item;
        this._styleSelectable(item, "selected", true);
      }
      else
      {
        delete this.__selection[hash];
        this._styleSelectable(item, "selected", false);
      }

      this.__selectionModified = true;
    },


    /**
     * Removes the given item from the current selection.
     *
     * @param item {Object} Any item
     */
    _removeFromSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (this.__selection[hash] != null)
      {
        delete this.__selection[hash];
        this._styleSelectable(item, "selected", false);

        this.__selectionModified = true;
      }
    },


    /**
     * Replaces current selection with items from given array.
     *
     * @param items {Array} List of items to select
     */
    _replaceMultiSelection : function(items)
    {
      var modified = false;

      // Build map from hash codes and filter non-selectables
      var selectable, hash;
      var incoming = {};
      for (var i=0, l=items.length; i<l; i++)
      {
        selectable = items[i];
        if (this._isSelectable(selectable))
        {
          hash = this._selectableToHashCode(selectable);
          incoming[hash] = selectable;
        }
      }

      // Remember last
      var first = items[0];
      var last = selectable;

      // Clear old entries from map
      var current = this.__selection;
      for (var hash in current)
      {
        if (incoming[hash])
        {
          // Reduce map to make next loop faster
          delete incoming[hash];
        }
        else
        {
          // update internal map
          selectable = current[hash];
          delete current[hash];

          // apply styling
          this._styleSelectable(selectable, "selected", false);

          // remember that the selection has been modified
          modified = true;
        }
      }

      // Add remaining selectables to selection
      for (var hash in incoming)
      {
        // update internal map
        selectable = current[hash] = incoming[hash];

        // apply styling
        this._styleSelectable(selectable, "selected", true);

        // remember that the selection has been modified
        modified = true;
      }

      // Do not do anything if selection is equal to previous one
      if (!modified) {
        return false;
      }

      // Scroll last incoming item into view
      this._scrollItemIntoView(last);

      // Reset anchor and lead item
      this._setLeadItem(first);
      this._setAnchorItem(first);

      // Finally fire change event
      this.__selectionModified = true;
      this._fireChange();
    },


    /**
     * Fires the selection change event if the selection has
     * been modified.
     *
     * @param context {String} One of <code>click</code>, <code>quick</code>,
     *    <code>drag</code> or <code>key</code> or <code>null</code>
     */
    _fireChange : function(context)
    {
      if (this.__selectionModified)
      {
        // Store context
        this.__selectionContext = context || null;

        // Fire data event which contains the current selection
        this.fireDataEvent("changeSelection", this.getSelection());
        delete this.__selectionModified;
      }
    },


    /**
     * Applies the default selection. The default item is the first item.
     *
     * @param force {Boolean} Whether the default selection sould forced.
     *
     * @return {var} The selected item.
     */
    _applyDefaultSelection : function(force)
    {
      if (force === true || this.getMode() === "one" && this.isSelectionEmpty())
      {
        var first = this._getFirstSelectable();
        if (first != null) {
          this.selectItem(first);
        }
        return first;
      }
      return null;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__scrollTimer");
    this.__selection = this.__mouseDownOnSelected = this.__anchorItem = null;
    this.__leadItem = null;
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * A selection manager, which handles the selection in widgets.
 */
qx.Class.define("qx.ui.core.selection.Widget",
{
  extend : qx.ui.core.selection.Abstract,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widget {qx.ui.core.Widget} The widget to connect to
   */
  construct : function(widget)
  {
    this.base(arguments);

    this.__widget = widget;
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __widget : null,

    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item) {
      return this._isItemSelectable(item) && item.getLayoutParent() === this.__widget;
    },


    // overridden
    _selectableToHashCode : function(item) {
      return item.$$hash;
    },


    // overridden
    _styleSelectable : function(item, type, enabled) {
      enabled ? item.addState(type) : item.removeState(type);
    },


    // overridden
    _capture : function() {
      this.__widget.capture();
    },


    // overridden
    _releaseCapture : function() {
      this.__widget.releaseCapture();
    },


    /**
     * Helper to return the selectability of the item concerning the
     * user interaaction.
     *
     * @param item {qx.ui.core.Widget} The item to check.
     * @return {Boolean} true, if the item is selectable.
     */
    _isItemSelectable : function(item) {
      if (this._userInteraction) {
        return item.isVisible() && item.isEnabled();
      } else {
        return item.isVisible();
      }
    },


    /**
     * Returns the connected widget.
     * @return {qx.ui.core.Widget} The widget
     */
    _getWidget : function() {
      return this.__widget;
    },




    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _getLocation : function()
    {
      var elem = this.__widget.getContentElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
    },


    // overridden
    _getDimension : function() {
      return this.__widget.getInnerSize();
    },


    // overridden
    _getSelectableLocationX : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        return {
          left : computed.left,
          right : computed.left + computed.width
        };
      }
    },


    // overridden
    _getSelectableLocationY : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        return {
          top : computed.top,
          bottom : computed.top + computed.height
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getScroll : function()
    {
      return {
        left : 0,
        top : 0
      };
    },


    // overridden
    _scrollBy : function(xoff, yoff) {
      // empty implementation
    },


    // overridden
    _scrollItemIntoView : function(item) {
      this.__widget.scrollChildIntoView(item);
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    getSelectables : function(all)
    {
      // if only the user selectables should be returned
      var oldUserInteraction = false;
      if (!all) {
        oldUserInteraction = this._userInteraction;
        this._userInteraction = true;
      }
      var children = this.__widget.getChildren();
      var result = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (this._isItemSelectable(child)) {
          result.push(child);
        }
      }

      // reset to the former user interaction state
      this._userInteraction = oldUserInteraction;
      return result;
    },


    // overridden
    _getSelectableRange : function(item1, item2)
    {
      // Fast path for identical items
      if (item1 === item2) {
        return [item1];
      }

      // Iterate over children and collect all items
      // between the given two (including them)
      var children = this.__widget.getChildren();
      var result = [];
      var active = false;
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child === item1 || child === item2)
        {
          if (active)
          {
            result.push(child);
            break;
          }
          else
          {
            active = true;
          }
        }

        if (active && this._isItemSelectable(child)) {
          result.push(child);
        }
      }

      return result;
    },


    // overridden
    _getFirstSelectable : function()
    {
      var children = this.__widget.getChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        if (this._isItemSelectable(children[i])) {
          return children[i];
        }
      }

      return null;
    },


    // overridden
    _getLastSelectable : function()
    {
      var children = this.__widget.getChildren();
      for (var i=children.length-1; i>0; i--)
      {
        if (this._isItemSelectable(children[i])) {
          return children[i];
        }
      }

      return null;
    },


    // overridden
    _getRelatedSelectable : function(item, relation)
    {
      var vertical = this.__widget.getOrientation() === "vertical";
      var children = this.__widget.getChildren();
      var index = children.indexOf(item);
      var sibling;

      if ((vertical && relation === "above") || (!vertical && relation === "left"))
      {
        for (var i=index-1; i>=0; i--)
        {
          sibling = children[i];
          if (this._isItemSelectable(sibling)) {
            return sibling;
          }
        }
      }
      else if ((vertical && relation === "under") || (!vertical && relation === "right"))
      {
        for (var i=index+1; i<children.length; i++)
        {
          sibling = children[i];
          if (this._isItemSelectable(sibling)) {
            return sibling;
          }
        }
      }

      return null;
    },


    // overridden
    _getPage : function(lead, up)
    {
      if (up) {
        return this._getFirstSelectable();
      } else {
        return this._getLastSelectable();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__widget = null;
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
     * Sebastian Werner (wpbasti)

************************************************************************ */


/**
 * A selection manager, which handles the selection in widgets extending
 * {@link qx.ui.core.scroll.AbstractScrollArea}.
 */
qx.Class.define("qx.ui.core.selection.ScrollArea",
{
  extend : qx.ui.core.selection.Widget,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item)
    {
      return this._isItemSelectable(item) &&
        item.getLayoutParent() === this._getWidget().getChildrenContainer();
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _getDimension : function() {
      return this._getWidget().getPaneSize();
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getScroll : function()
    {
      var widget = this._getWidget();

      return {
        left : widget.getScrollX(),
        top : widget.getScrollY()
      };
    },


    // overridden
    _scrollBy : function(xoff, yoff)
    {
      var widget = this._getWidget();

      widget.scrollByX(xoff);
      widget.scrollByY(yoff);
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getPage : function(lead, up)
    {
      var selectables = this.getSelectables();
      var length = selectables.length;
      var start = selectables.indexOf(lead);

      // Given lead is not a selectable?!?
      if (start === -1) {
        throw new Error("Invalid lead item: " + lead);
      }

      var widget = this._getWidget();
      var scrollTop = widget.getScrollY();
      var innerHeight = widget.getInnerSize().height;
      var top, bottom, found;

      if (up)
      {
        var min = scrollTop;
        var i=start;

        // Loop required to scroll pages up dynamically
        while(1)
        {
          // Iterate through all selectables from start
          for (; i>=0; i--)
          {
            top = widget.getItemTop(selectables[i]);

            // This item is out of the visible block
            if (top < min)
            {
              // Use previous one
              found = i+1;
              break;
            }
          }

          // Nothing found. Return first item.
          if (found == null)
          {
            var first = this._getFirstSelectable();
            return first == lead ? null : first;
          }

          // Found item, but is identical to start or even before start item
          // Update min positon and try on previous page
          if (found >= start)
          {
            // Reduce min by the distance of the lead item to the visible
            // bottom edge. This is needed instead of a simple subtraction
            // of the inner height to keep the last lead visible on page key
            // presses. This is the behavior of native toolkits as well.
            min -= innerHeight + scrollTop - widget.getItemBottom(lead);
            found = null;
            continue;
          }

          // Return selectable
          return selectables[found];
        }
      }
      else
      {
        var max = innerHeight + scrollTop;
        var i=start;

        // Loop required to scroll pages down dynamically
        while(1)
        {
          // Iterate through all selectables from start
          for (; i<length; i++)
          {
            bottom = widget.getItemBottom(selectables[i]);

            // This item is out of the visible block
            if (bottom > max)
            {
              // Use previous one
              found = i-1;
              break;
            }
          }

          // Nothing found. Return last item.
          if (found == null)
          {
            var last = this._getLastSelectable();
            return last == lead ? null : last;
          }

          // Found item, but is identical to start or even before start item
          // Update max position and try on next page
          if (found <= start)
          {
            // Extend max by the distance of the lead item to the visible
            // top edge. This is needed instead of a simple addition
            // of the inner height to keep the last lead visible on page key
            // presses. This is the behavior of native toolkits as well.
            max += widget.getItemTop(lead) - scrollTop;
            found = null;
            continue;
          }

          // Return selectable
          return selectables[found];
        }
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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * This mixin links all methods to manage the multi selection from the
 * internal selection manager to the widget.
 */
qx.Mixin.define("qx.ui.core.MMultiSelectionHandling",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    // Create selection manager
    var clazz = this.SELECTION_MANAGER;
    var manager = this.__manager = new clazz(this);

    // Add widget event listeners
    this.addListener("mousedown", manager.handleMouseDown, manager);
    this.addListener("mouseup", manager.handleMouseUp, manager);
    this.addListener("mouseover", manager.handleMouseOver, manager);
    this.addListener("mousemove", manager.handleMouseMove, manager);
    this.addListener("losecapture", manager.handleLoseCapture, manager);
    this.addListener("keypress", manager.handleKeyPress, manager);

    this.addListener("addItem", manager.handleAddItem, manager);
    this.addListener("removeItem", manager.handleRemoveItem, manager);

    // Add manager listeners
    manager.addListener("changeSelection", this._onSelectionChange, this);
  },


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
     PROPERTIES
  *****************************************************************************
  */


  properties :
  {
    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : [ "single", "multi", "additive", "one" ],
      init : "single",
      apply : "_applySelectionMode"
    },

    /**
     * Enable drag selection (multi selection of items through
     * dragging the mouse in pressed states).
     *
     * Only possible for the selection modes <code>multi</code> and <code>additive</code>
     */
    dragSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDragSelection"
    },

    /**
     * Enable quick selection mode, where no click is needed to change the selection.
     *
     * Only possible for the modes <code>single</code> and <code>one</code>.
     */
    quickSelection :
    {
      check : "Boolean",
      init : false,
      apply : "_applyQuickSelection"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /** {qx.ui.core.selection.Abstract} The selection manager */
    __manager : null,


    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */


    /**
     * Selects all items of the managed object.
     */
    selectAll : function() {
      this.__manager.selectAll();
    },


    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item.
     * @return {Boolean} Whether the item is selected.
     * @throws an exception if the item is not a child element.
     */
    isSelected : function(item) {
      if (!qx.ui.core.Widget.contains(this, item)) {
        throw new Error("Could not test if " + item +
          " is selected, because it is not a child element!");
      }

      return this.__manager.isItemSelected(item);
    },


    /**
     * Adds the given item to the existing selection.
     *
     * Use {@link #setSelection} instead if you want to replace
     * the current selection.
     *
     * @param item {qx.ui.core.Widget} Any valid item.
     * @throws an exception if the item is not a child element.
     */
    addToSelection : function(item) {
      if (!qx.ui.core.Widget.contains(this, item)) {
        throw new Error("Could not add + " + item +
          " to selection, because it is not a child element!");
      }

      this.__manager.addItem(item);
    },


    /**
     * Removes the given item from the selection.
     *
     * Use {@link #resetSelection} when you want to clear
     * the whole selection at once.
     *
     * @param item {qx.ui.core.Widget} Any valid item
     * @throws an exception if the item is not a child element.
     */
    removeFromSelection : function(item) {
      if (!qx.ui.core.Widget.contains(this, item)) {
        throw new Error("Could not remove " + item +
          " from selection, because it is not a child element!");
      }

      this.__manager.removeItem(item);
    },


    /**
     * Selects an item range between two given items.
     *
     * @param begin {qx.ui.core.Widget} Item to start with
     * @param end {qx.ui.core.Widget} Item to end at
     */
    selectRange : function(begin, end) {
      this.__manager.selectItemRange(begin, end);
    },


    /**
     * Clears the whole selection at once. Also
     * resets the lead and anchor items and their
     * styles.
     */
    resetSelection : function() {
      this.__manager.clearSelection();
    },


    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select.
     * @throws an exception if one of the items is not a child element and if
     *    the mode is set to <code>single</code> or <code>one</code> and
     *    the items contains more than one item.
     */
    setSelection : function(items) {
      for (var i = 0; i < items.length; i++) {
        if (!qx.ui.core.Widget.contains(this, items[i])) {
          throw new Error("Could not select " + items[i] +
            ", because it is not a child element!");
        }
      }

      if (items.length === 0) {
        this.resetSelection();
      } else {
        var currentSelection = this.getSelection();
        if (!qx.lang.Array.equals(currentSelection, items)) {
          this.__manager.replaceSelection(items);
        }
      }
    },


    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {
      return this.__manager.getSelection();
    },

    /**
     * Returns an array of currently selected items sorted
     * by their index in the container.
     *
     * @return {qx.ui.core.Widget[]} Sorted list of items
     */
    getSortedSelection : function() {
      return this.__manager.getSortedSelection();
    },

    /**
     * Whether the selection is empty
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      return this.__manager.isSelectionEmpty();
    },

    /**
     * Returns the last selection context.
     *
     * @return {String | null} One of <code>click</code>, <code>quick</code>,
     *    <code>drag</code> or <code>key</code> or <code>null</code>.
     */
    getSelectionContext : function() {
      return this.__manager.getSelectionContext();
    },

    /**
     * Returns the internal selection manager. Use this with
     * caution!
     *
     * @return {qx.ui.core.selection.Abstract} The selection manager
     */
    _getManager : function() {
      return this.__manager;
    },

    /**
     * Returns all elements which are selectable.
     *
     * @param all {boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function(all) {
      return this.__manager.getSelectables(all);
    },

    /**
     * Invert the selection. Select the non selected and deselect the selected.
     */
    invertSelection: function() {
      this.__manager.invertSelection();
    },


    /**
     * Returns the current lead item. Generally the item which was last modified
     * by the user (clicked on etc.)
     *
     * @return {qx.ui.core.Widget} The lead item or <code>null</code>
     */
    _getLeadItem : function() {
      var mode = this.__manager.getMode();

      if (mode === "single" || mode === "one") {
        return this.__manager.getSelectedItem();
      } else {
        return this.__manager.getLeadItem();
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applySelectionMode : function(value, old) {
      this.__manager.setMode(value);
    },

    // property apply
    _applyDragSelection : function(value, old) {
      this.__manager.setDrag(value);
    },

    // property apply
    _applyQuickSelection : function(value, old) {
      this.__manager.setQuick(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>changeSelection</code> event on selection manager.
     *
     * @param e {qx.event.type.Data} Data event
     */
    _onSelectionChange : function(e) {
      this.fireDataEvent("changeSelection", e.getData());
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
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin handling the valid and required properties for the form widgets.
 */
qx.Mixin.define("qx.ui.form.MForm",
{

  construct : function()
  {
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this.__onChangeLocale, this);
    }
  },


  properties : {

    /**
     * Flag signaling if a widget is valid. If a widget is invalid, an invalid
     * state will be set.
     */
    valid : {
      check : "Boolean",
      init : true,
      apply : "_applyValid",
      event : "changeValid"
    },


    /**
     * Flag signaling if a widget is required.
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
      event : "changeInvalidMessage"
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


  members : {
    // apply method
    _applyValid: function(value, old) {
      value ? this.removeState("invalid") : this.addState("invalid");
    },


    /**
     * Locale change event handler
     *
     * @signature function(e)
     * @param e {Event} the change event
     */
    __onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e)
      {
        // invalid message
        var invalidMessage = this.getInvalidMessage();
        if (invalidMessage && invalidMessage.translate) {
          this.setInvalidMessage(invalidMessage.translate());
        }
        // required invalid message
        var requiredInvalidMessage = this.getRequiredInvalidMessage();
        if (requiredInvalidMessage && requiredInvalidMessage.translate) {
          this.setRequiredInvalidMessage(requiredInvalidMessage.translate());
        }
      },

      "false" : null
    })
  },


  destruct : function()
  {
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this.__onChangeLocale, this);
    }
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This mixin offers the selection of the model properties.
 * It can only be included if the object including it implements the
 * {@link qx.ui.core.ISingleSelection} interface and the selectables implement
 * the {@link qx.ui.form.IModel} interface.
 */
qx.Mixin.define("qx.ui.form.MModelSelection",
{

  construct : function() {
    // create the selection array
    this.__modelSelection = new qx.data.Array();

    // listen to the changes
    this.__modelSelection.addListener("change", this.__onModelSelectionArrayChange, this);
    this.addListener("changeSelection", this.__onModelSelectionChange, this);
  },


  events :
  {
    /**
     * Pseudo event. It will never be fired because the array itself can not
     * be changed. But the event description is needed for the data binding.
     */
    changeModelSelection : "qx.event.type.Data"
  },


  members :
  {

    __modelSelection : null,
    __inSelectionChange : false,


    /**
     * Handler for the selection change of the including class e.g. SelectBox,
     * List, ...
     * It sets the new modelSelection via {@link #setModelSelection}.
     */
    __onModelSelectionChange : function() {
      if (this.__inSelectionChange) {
        return;
      }
      var data = this.getSelection();

      // create the array with the modes inside
      var modelSelection = [];
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        // fallback if getModel is not implemented
        var model = item.getModel ? item.getModel() : null;
        if (model !== null) {
          modelSelection.push(model);
        }
      };

      // only change the selection if you are sure that its correct [BUG #3748]
      if (modelSelection.length === data.length) {
        try {
          this.setModelSelection(modelSelection);
        } catch (e) {
          throw new Error(
            "Could not set the model selection. Maybe your models are not unique?"
          );
        }
      }
    },


    /**
     * Listener for the change of the internal model selection data array.
     */
    __onModelSelectionArrayChange : function() {
      this.__inSelectionChange = true;
      var selectables = this.getSelectables(true);
      var itemSelection = [];

      var modelSelection = this.__modelSelection.toArray();
      for (var i = 0; i < modelSelection.length; i++) {
        var model = modelSelection[i];
        for (var j = 0; j < selectables.length; j++) {
          var selectable = selectables[j];
          // fallback if getModel is not implemented
          var selectableModel = selectable.getModel ? selectable.getModel() : null;
          if (model === selectableModel) {
            itemSelection.push(selectable);
            break;
          }
        }
      }
      this.setSelection(itemSelection);
      this.__inSelectionChange = false;

      // check if the setting has worked
      var currentSelection = this.getSelection();
      if (!qx.lang.Array.equals(currentSelection, itemSelection)) {
        // if not, set the actual selection
        this.__onModelSelectionChange();
      }
    },


    /**
     * Returns always an array of the models of the selected items. If no
     * item is selected or no model is given, the array will be empty.
     *
     * *CAREFUL!* The model selection can only work if every item item in the
     * selection providing widget has a model property!
     *
     * @return {qx.data.Array} An array of the models of the selected items.
     */
    getModelSelection : function()
    {
      return this.__modelSelection;
    },


    /**
     * Takes the given models in the array and searches for the corresponding
     * selectables. If an selectable does have that model attached, it will be
     * selected.
     *
     * *Attention:* This method can have a time complexity of O(n^2)!
     *
     * *CAREFUL!* The model selection can only work if every item item in the
     * selection providing widget has a model property!
     *
     * @param modelSelection {Array} An array of models, which should be
     *   selected.
     */
    setModelSelection : function(modelSelection)
    {
      // check for null values
      if (!modelSelection)
      {
        this.__modelSelection.removeAll();
        return;
      }

      if (qx.core.Environment.get("qx.debug")) {
        this.assertArray(modelSelection, "Please use an array as parameter.");
      }

      // add the first two parameter
      modelSelection.unshift(this.__modelSelection.getLength()); // remove index
      modelSelection.unshift(0);  // start index

      var returnArray = this.__modelSelection.splice.apply(this.__modelSelection, modelSelection);
      returnArray.dispose();
    }
  },

  destruct : function() {
    this._disposeObjects("__modelSelection");
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin used for the bubbling events. If you want to use this in your own model
 * classes, be sure that every property will call the
 * {@link #_applyEventPropagation} function on every change.
 */
qx.Mixin.define("qx.data.marshal.MEventBubbling",
{

  events :
  {
    /**
     * The change event which will be fired on every change in the model no
     * matter what property changes. This event bubbles so the root model will
     * fire a change event on every change of its children properties too.
     *
     * Note that properties are required to call
     * {@link #_applyEventPropagation} on apply for changes to be tracked as
     * desired. It is already taken care of that properties created with the
     * {@link qx.data.marshal.Json} marshaler call this method.
     *
     * The data will contain a map with the following three keys
     *   <li>value: The new value of the property</li>
     *   <li>old: The old value of the property.</li>
     *   <li>name: The name of the property changed including its parent
     *     properties separated by dots.</li>
     *   <li>item: The item which has the changed property.</li>
     * Due to that, the <code>getOldData</code> method will always return null
     * because the old data is contained in the map.
     */
    "changeBubble": "qx.event.type.Data"
  },


  members :
  {
    /**
     * Apply function for every property created with the
     * {@link qx.data.marshal.Json} marshaler. It fires and
     * {@link #changeBubble} event on every change. It also adds the chaining
     * listener if possible which is necessary for the bubbling of the events.
     *
     * @param value {var} The new value of the property.
     * @param old {var} The old value of the property.
     * @param name {String} The name of the changed property.
     */
    _applyEventPropagation : function(value, old, name)
    {
      this.fireDataEvent("changeBubble", {
        value: value, name: name, old: old, item: this
      });

      this._registerEventChaining(value, old, name);
    },


    /**
     * Registers for the given parameters the changeBubble listener, if
     * possible. It also removes the old listener, if an old item with
     * a changeBubble event is given.
     *
     * @param value {var} The new value of the property.
     * @param old {var} The old value of the property.
     * @param name {String} The name of the changed property.
     */
    _registerEventChaining : function(value, old, name)
    {
      // if an old value is given, remove the old listener if possible
      if (old != null && old.getUserData && old.getUserData("idBubble-" + this.$$hash) != null) {
        var listeners = old.getUserData("idBubble-" + this.$$hash);
        for (var i = 0; i < listeners.length; i++) {
          old.removeListenerById(listeners[i]);
        }
        old.setUserData("idBubble-" + this.$$hash, null);
      }

      // if the child supports chaining
      if ((value instanceof qx.core.Object)
        && qx.Class.hasMixin(value.constructor, qx.data.marshal.MEventBubbling)
      ) {
        // create the listener
        var listener = qx.lang.Function.bind(
          this.__changePropertyListener, this, name
        );
        // add the listener
        var id = value.addListener("changeBubble", listener, this);
        var listeners = value.getUserData("idBubble-" + this.$$hash);
        if (listeners == null)
        {
          listeners = [];
          value.setUserData("idBubble-" + this.$$hash, listeners);
        }
        listeners.push(id);
      }
    },


    /**
     * Listener responsible for formating the name and firing the change event
     * for the changed property.
     *
     * @param name {String} The name of the former properties.
     * @param e {qx.event.type.Data} The date event fired by the property
     *   change.
     */
    __changePropertyListener : function(name, e)
    {
      var data = e.getData();
      var value = data.value;
      var old = data.old;

      // if the target is an array
      if (qx.Class.hasInterface(e.getTarget().constructor, qx.data.IListData)) {

        if (data.name.indexOf) {
          var dotIndex = data.name.indexOf(".") != -1 ? data.name.indexOf(".") : data.name.length;
          var bracketIndex = data.name.indexOf("[") != -1 ? data.name.indexOf("[") : data.name.length;

          // braktes in the first spot is ok [BUG #5985]
          if (bracketIndex == 0) {
            var newName = name + data.name;
          } else if (dotIndex < bracketIndex) {
            var index = data.name.substring(0, dotIndex);
            var rest = data.name.substring(dotIndex + 1, data.name.length);
            if (rest[0] != "[") {
              rest = "." + rest;
            }
            var newName =  name + "[" + index + "]" + rest;
          } else if (bracketIndex < dotIndex) {
            var index = data.name.substring(0, bracketIndex);
            var rest = data.name.substring(bracketIndex, data.name.length);
            var newName =  name + "[" + index + "]" + rest;
          } else {
            var newName =  name + "[" + data.name + "]";
          }
        } else {
          var newName =  name + "[" + data.name + "]";
        }

      // if the target is not an array
      } else {
        // special case for array as first element of the chain [BUG #5985]
        if (parseInt(name) == name && name !== "") {
          name = "[" + name + "]";
        }
        var newName =  name + "." + data.name;
      }

      this.fireDataEvent(
        "changeBubble",
        {
          value: value,
          name: newName,
          old: old,
          item: data.item || e.getTarget()
        }
      );
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The data array is a special array used in the data binding context of
 * qooxdoo. It does not extend the native array of JavaScript but its a wrapper
 * for it. All the native methods are included in the implementation and it
 * also fires events if the content or the length of the array changes in
 * any way. Also the <code>.length</code> property is available on the array.
 */
qx.Class.define("qx.data.Array",
{
  extend : qx.core.Object,
  include : qx.data.marshal.MEventBubbling,
  implement : [qx.data.IListData],

  /**
   * Creates a new instance of an array.
   *
   * @param param {var} The parameter can be some types.<br/>
   *   Without a parameter a new blank array will be created.<br/>
   *   If there is more than one parameter is given, the parameter will be
   *   added directly to the new array.<br/>
   *   If the parameter is a number, a new Array with the given length will be
   *   created.<br/>
   *   If the parameter is a JavaScript array, a new array containing the given
   *   elements will be created.
   */
  construct : function(param)
  {
    this.base(arguments);
    // if no argument is given
    if (param == undefined) {
      this.__array = [];

    // check for elements (create the array)
    } else if (arguments.length > 1) {
      // create an empty array and go through every argument and push it
      this.__array = [];
      for (var i = 0; i < arguments.length; i++) {
        this.__array.push(arguments[i]);
      }

    // check for a number (length)
    } else if (typeof param == "number") {
      this.__array = new Array(param);
    // check for an array itself
    } else if (param instanceof Array) {
      this.__array = qx.lang.Array.clone(param);

    // error case
    } else {
      this.__array = [];
      this.dispose();
      throw new Error("Type of the parameter not supported!");
    }

    // propagate changes
    for (var i=0; i<this.__array.length; i++) {
      this._applyEventPropagation(this.__array[i], null, i);
    }

    // update the length at startup
    this.__updateLength();

    // work against the console printout of the array
    if (qx.core.Environment.get("qx.debug")) {
      this[0] = "Please use 'toArray()' to see the content.";
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
     * Flag to set the dispose behavior of the array. If the property is set to
     * <code>true</code>, the array will dispose its content on dispose, too.
     */
    autoDisposeItems : {
      check : "Boolean",
      init : false
    }
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * The change event which will be fired if there is a change in the array.
     * The data contains a map with three key value pairs:
     * <li>start: The start index of the change.</li>
     * <li>end: The end index of the change.</li>
     * <li>type: The type of the change as a String. This can be 'add',
     * 'remove' or 'order'</li>
     * <li>items: The items which has been changed (as a JavaScript array).</li>
     */
    "change" : "qx.event.type.Data",


    /**
     * The changeLength event will be fired every time the length of the
     * array changes.
     */
    "changeLength": "qx.event.type.Data"
  },


  members :
  {
    // private members
    __array : null,


    /**
     * Concatenates the current and the given array into a new one.
     *
     * @param array {Array} The javaScript array which should be concatenated
     *   to the current array.
     *
     * @return {qx.data.Array} A new array containing the values of both former
     *   arrays.
     */
    concat: function(array) {
      if (array) {
        var newArray = this.__array.concat(array);
      } else {
        var newArray = this.__array.concat();
      }
      return new qx.data.Array(newArray);
    },


    /**
     * Returns the array as a string using the given connector string to
     * connect the values.
     *
     * @param connector {String} the string which should be used to past in
     *  between of the array values.
     *
     * @return {String} The array as a string.
     */
    join: function(connector) {
      return this.__array.join(connector);
    },


    /**
     * Removes and returns the last element of the array.
     * An change event will be fired.
     *
     * @return {var} The last element of the array.
     */
    pop: function() {
      var item = this.__array.pop();
      this.__updateLength();
      // remove the possible added event listener
      this._registerEventChaining(null, item, this.length - 1);
      // fire change bubble event
      this.fireDataEvent("changeBubble", {
        value: [],
        name: this.length + "",
        old: [item],
        item: this
      });

      this.fireDataEvent("change",
        {
          start: this.length - 1,
          end: this.length - 1,
          type: "remove",
          items: [item]
        }, null
      );
      return item;
    },


    /**
     * Adds an element at the end of the array.
     *
     * @param varargs {var} Multiple elements. Every element will be added to
     *   the end of the array. An change event will be fired.
     *
     * @return {Number} The new length of the array.
     */
    push: function(varargs) {
      for (var i = 0; i < arguments.length; i++) {
        this.__array.push(arguments[i]);
        this.__updateLength();
        // apply to every pushed item an event listener for the bubbling
        this._registerEventChaining(arguments[i], null, this.length - 1);

        // fire change bubbles event
        this.fireDataEvent("changeBubble", {
          value: [arguments[i]],
          name: (this.length - 1) + "",
          old: [],
          item: this
        });

        // fire change event
        this.fireDataEvent("change",
          {
            start: this.length - 1,
            end: this.length - 1,
            type: "add",
            items: [arguments[i]]
          }, null
        );
      }
      return this.length;
    },


    /**
     * Reverses the order of the array. An change event will be fired.
     */
    reverse: function() {
      // ignore on empty arrays
      if (this.length == 0) {
        return;
      }

      var oldArray = this.__array.concat();
      this.__array.reverse();

      this.__updateEventPropagation(0, this.length);

      this.fireDataEvent("change",
        {start: 0, end: this.length - 1, type: "order", items: null}, null
      );

      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value: this.__array,
        name: "0-" + (this.__array.length - 1),
        old: oldArray,
        item: this
      });
    },


    /**
     * Removes the first element of the array and returns it. An change event
     * will be fired.
     *
     * @return {var} the former first element.
     */
    shift: function() {
      // ignore on empty arrays
      if (this.length == 0) {
        return;
      }

      var item = this.__array.shift();
      this.__updateLength();
      // remove the possible added event listener
      this._registerEventChaining(null, item, this.length -1);
      // as every item has changed its position, we need to update the event bubbling
      this.__updateEventPropagation(0, this.length);

      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value: [],
        name: "0",
        old: [item],
        item: this
      });

      // fire change event
      this.fireDataEvent("change",
        {
          start: 0,
          end: this.length -1,
          type: "remove",
          items: [item]
        }, null
      );
      return item;
    },


    /**
     * Returns a new array based on the range specified by the parameters.
     *
     * @param from {Number} The start index.
     * @param to {Number?null} The end index. If omitted, slice extracts to the
     *   end of the array.
     *
     * @return {qx.data.Array} A new array containing the given range of values.
     */
    slice: function(from, to) {
      return new qx.data.Array(this.__array.slice(from, to));
    },


    /**
     * Method to remove and add new elements to the array. For every remove or
     * add an event will be fired.
     *
     * @param startIndex {Integer} The index where the splice should start
     * @param amount {Integer} Defines number of elements which will be removed
     *   at the given position.
     * @param varargs {var} All following parameters will be added at the given
     *   position to the array.
     * @return {qx.data.Array} An data array containing the removed elements.
     *   Keep in to dispose this one, even if you don't use it!
     */
    splice: function(startIndex, amount, varargs) {
      // store the old length
      var oldLength = this.__array.length;

      // invoke the slice on the array
      var returnArray = this.__array.splice.apply(this.__array, arguments);

      // fire a change event for the length
      if (this.__array.length != oldLength) {
        this.__updateLength();
      }
      // fire an event for the change
      var removed = amount > 0;
      var added = arguments.length > 2;
      var items = null;
      if (removed || added) {
        if (this.__array.length > oldLength) {
          var type = "add";
          items = qx.lang.Array.fromArguments(arguments, 2);
        } else if (this.__array.length < oldLength) {
          var type = "remove";
          items = returnArray;
        } else {
          var type = "order";
        }
        this.fireDataEvent("change",
          {
            start: startIndex,
            end: this.length - 1,
            type: type,
            items: items
          }, null
        );
      }
      // add listeners
      for (var i = 2; i < arguments.length; i++) {
        this._registerEventChaining(arguments[i], null, startIndex + i);
      }
      // apply event chaining for every item moved
      this.__updateEventPropagation(startIndex + arguments.length - 2, this.length);

      // fire the changeBubble event
      var value = [];
      for (var i=2; i < arguments.length; i++) {
        value[i-2] = arguments[i];
      };
      var endIndex = (startIndex + Math.max(arguments.length - 3 , amount - 1));
      var name = startIndex == endIndex ? endIndex : startIndex + "-" + endIndex;
      this.fireDataEvent("changeBubble", {
        value: value, name: name + "", old: returnArray, item: this
      });

      // remove the listeners
      for (var i = 0; i < returnArray.length; i++) {
        this._registerEventChaining(null, returnArray[i], i);
      }
      return (new qx.data.Array(returnArray));
    },


    /**
     * Sorts the array. If a function is given, this will be used to
     * compare the items. <code>changeBubble</code> event will only be fired,
     * if sorting result differs from original array.
     *
     * @param func {Function} A compare function comparing two parameters and
     *   should return a number.
     */
    sort: function(func) {
      // ignore if the array is empty
      if (this.length == 0) {
        return;
      }
      var oldArray = this.__array.concat();

      this.__array.sort.apply(this.__array, arguments);

      // prevent changeBubble event if nothing has been changed
      if (qx.lang.Array.equals(this.__array, oldArray) === true){
        return;
      }

      this.__updateEventPropagation(0, this.length);

      this.fireDataEvent("change",
        {start: 0, end: this.length - 1, type: "order", items: null}, null
      );

      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value: this.__array,
        name: "0-" + (this.length - 1),
        old: oldArray,
        item: this
      });
    },


    /**
     * Adds the given items to the beginning of the array. For every element,
     * a change event will be fired.
     *
     * @param varargs {var} As many elements as you want to add to the beginning.
     */
    unshift: function(varargs) {
      for (var i = arguments.length - 1; i >= 0; i--) {
        this.__array.unshift(arguments[i])
        this.__updateLength();
        // apply to every item an event listener for the bubbling
        this.__updateEventPropagation(0, this.length);

        // fire change bubbles event
        this.fireDataEvent("changeBubble", {
          value: [this.__array[0]],
          name: "0",
          old: [this.__array[1]],
          item: this
        });

        // fire change event
        this.fireDataEvent("change",
          {
            start: 0,
            end: this.length - 1,
            type: "add",
            items: [arguments[i]]
          }, null
        );
      }
      return this.length;
    },


    /**
     * Returns the list data as native array. Beware of the fact that the
     * internal representation will be returnd and any manipulation of that
     * can cause a misbehavior of the array. This method should only be used for
     * debugging purposes.
     *
     * @return {Array} The native array.
     */
    toArray: function() {
      return this.__array;
    },


    /**
     * Replacement function for the getting of the array value.
     * array[0] should be array.getItem(0).
     *
     * @param index {Number} The index requested of the array element.
     *
     * @return {var} The element at the given index.
     */
    getItem: function(index) {
      return this.__array[index];
    },


    /**
     * Replacement function for the setting of an array value.
     * array[0] = "a" should be array.setItem(0, "a").
     * A change event will be fired if the value changes. Setting the same
     * value again will not lead to a change event.
     *
     * @param index {Number} The index of the array element.
     * @param item {var} The new item to set.
     */
    setItem: function(index, item) {
      var oldItem = this.__array[index];
      // ignore settings of already set items [BUG #4106]
      if (oldItem === item) {
        return;
      }
      this.__array[index] = item;
      // set an event listener for the bubbling
      this._registerEventChaining(item, oldItem, index);
      // only update the length if its changed
      if (this.length != this.__array.length) {
        this.__updateLength();
      }

      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value: [item],
        name: index + "",
        old: [oldItem],
        item: this
      });

      // fire change event
      this.fireDataEvent("change",
        {
          start: index,
          end: index,
          type: "add",
          items: [item]
        }, null
      );
    },


    /**
     * This method returns the current length stored under .length on each
     * array.
     *
     * @return {Number} The current length of the array.
     */
    getLength: function() {
      return this.length;
    },


    /**
     * Returns the index of the item in the array. If the item is not in the
     * array, -1 will be returned.
     *
     * @param item {var} The item of which the index should be returned.
     * @return {Number} The Index of the given item.
     */
    indexOf: function(item) {
      return this.__array.indexOf(item);
    },


    /**
     * Returns the toString of the original Array
     * @return {String} The array as a string.
     */
    toString: function() {
      if (this.__array != null) {
        return this.__array.toString();
      }
      return "";
    },


    /*
    ---------------------------------------------------------------------------
       IMPLEMENTATION OF THE QX.LANG.ARRAY METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Check if the given item is in the current array.
     *
     * @param item {var} The item which is possibly in the array.
     * @return {boolean} true, if the array contains the given item.
     */
    contains: function(item) {
      return this.__array.indexOf(item) !== -1;
    },


    /**
     * Return a copy of the given arr
     *
     * @return {qx.data.Array} copy of this
     */
    copy : function() {
      return this.concat();
    },


    /**
     * Insert an element at a given position.
     *
     * @param index {Integer} Position where to insert the item.
     * @param item {var} The element to insert.
     */
    insertAt : function(index, item)
    {
      this.splice(index, 0, item).dispose();
    },


    /**
     * Insert an item into the array before a given item.
     *
     * @param before {var} Insert item before this object.
     * @param item {var} The item to be inserted.
     */
    insertBefore : function(before, item)
    {
      var index = this.indexOf(before);

      if (index == -1) {
        this.push(item);
      } else {
        this.splice(index, 0, item).dispose();
      }
    },


    /**
     * Insert an element into the array after a given item.
     *
     * @param after {var} Insert item after this object.
     * @param item {var} Object to be inserted.
     */
    insertAfter : function(after, item)
    {
      var index = this.indexOf(after);

      if (index == -1 || index == (this.length - 1)) {
        this.push(item);
      } else {
        this.splice(index + 1, 0, item).dispose();
      }
    },


    /**
     * Remove an element from the array at the given index.
     *
     * @param index {Integer} Index of the item to be removed.
     * @return {var} The removed item.
     */
    removeAt : function(index) {
      var returnArray = this.splice(index, 1);
      var item = returnArray.getItem(0);
      returnArray.dispose();
      return item;
    },


    /**
     * Remove all elements from the array.
     *
     * @return {Array} A native array containing the removed elements.
     */
    removeAll : function() {
      // remove all possible added event listeners
      for (var i = 0; i < this.__array.length; i++) {
        this._registerEventChaining(null, this.__array[i], i);
      }

      // ignore if array is empty
      if (this.getLength() == 0) {
        return;
      }

      // store the old data
      var oldLength = this.getLength();
      var items = this.__array.concat();

      // change the length
      this.__array.length = 0;
      this.__updateLength();

      // fire change bubbles event
      this.fireDataEvent("changeBubble", {
        value: [],
        name: "0-" + (oldLength - 1),
        old: items,
        item: this
      });

      // fire the change event
      this.fireDataEvent("change",
        {
          start: 0,
          end: oldLength - 1,
          type: "remove",
          items: items
        }, null
      );
      return items;
    },


    /**
     * Append the items of the given array.
     *
     * @param array {Array|qx.data.IListData} The items of this array will
     * be appended.
     * @throws An exception if the second argument is not an array.
     */
    append : function(array)
    {
      // qooxdoo array support
      if (array instanceof qx.data.Array) {
        array = array.toArray();
      }

      // this check is important because opera throws an uncatchable error if
      // apply is called without an array as argument.
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertArray(array, "The parameter must be an array.");
      }

      Array.prototype.push.apply(this.__array, array);

      // add a listener to the new items
      for (var i = 0; i < array.length; i++) {
        this._registerEventChaining(array[i], null, this.__array.length + i);
      }

      var oldLength = this.length;
      this.__updateLength();

      // fire change bubbles
      var name =
        oldLength == (this.length-1) ?
        oldLength :
        oldLength + "-" + (this.length-1);
      this.fireDataEvent("changeBubble", {
        value: array,
        name: name + "",
        old: [],
        item: this
      });

      // fire the change event
      this.fireDataEvent("change",
        {
          start: oldLength,
          end: this.length - 1,
          type: "add",
          items: array
        }, null
      );
    },


    /**
     * Remove the given item.
     *
     * @param item {var} Item to be removed from the array.
     * @return {var} The removed item.
     */
    remove : function(item)
    {
      var index = this.indexOf(item);

      if (index != -1)
      {
        this.splice(index, 1).dispose();
        return item;
      }
    },


    /**
     * Check whether the given array has the same content as this.
     * Checks only the equality of the arrays' content.
     *
     * @param array {qx.data.Array} The array to check.
     * @return {Boolean} Whether the two arrays are equal.
     */
    equals : function(array)
    {
      if (this.length !== array.length) {
        return false;
      }

      for (var i = 0; i < this.length; i++)
      {
        if (this.getItem(i) !== array.getItem(i)) {
          return false;
        }
      }

      return true;
    },


    /**
     * Returns the sum of all values in the array. Supports
     * numeric values only.
     *
     * @return {Number} The sum of all values.
     */
    sum : function()
    {
      var result = 0;
      for (var i = 0; i < this.length; i++) {
        result += this.getItem(i);
      }

      return result;
    },


    /**
     * Returns the highest value in the given array.
     * Supports numeric values only.
     *
     * @return {Number | null} The highest of all values or undefined if the
     *   array is empty.
     */
    max : function()
    {
      var result = this.getItem(0);

      for (var i = 1; i < this.length; i++)
      {
        if (this.getItem(i) > result) {
          result = this.getItem(i);
        }
      }

      return result === undefined ? null : result;
    },


    /**
     * Returns the lowest value in the array. Supports
     * numeric values only.
     *
     * @return {Number | null} The lowest of all values or undefined
     *   if the array is empty.
     */
    min : function()
    {
      var result = this.getItem(0);

      for (var i = 1; i < this.length; i++)
      {
        if (this.getItem(i) < result) {
          result = this.getItem(i);
        }
      }

      return result === undefined ? null : result;
    },


    /**
     * Invokes the given function for every item in the array.
     *
     * @param callback {Function} The function which will be call for every
     *   item in the array. It will be invoked with three parameters:
     *   the item, the index and the array itself.
     * @param context {var} The context in which the callback will be invoked.
     */
    forEach : function(callback, context)
    {
      for (var i = 0; i < this.__array.length; i++) {
        callback.call(context, this.__array[i], i, this);
      }
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL HELPERS
    ---------------------------------------------------------------------------
    */
    /**
     * Internal function which updates the length property of the array.
     * Every time the length will be updated, a {@link #changeLength} data
     * event will be fired.
     */
    __updateLength: function() {
      var oldLength = this.length;
      this.length = this.__array.length;
      this.fireDataEvent("changeLength", this.length, oldLength);
    },


    /**
     * Helper to update the event propagation for a range of items.
     * @param from {Number} Start index.
     * @param to {Number} End index.
     */
    __updateEventPropagation : function(from, to) {
      for (var i=from; i < to; i++) {
        this._registerEventChaining(this.__array[i], this.__array[i], i);
      };
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
  */

  destruct : function() {
    for (var i = 0; i < this.__array.length; i++) {
      var item = this.__array[i];
      this._applyEventPropagation(null, item, i);

      // dispose the items on auto dispose
      if (this.isAutoDisposeItems() && item && item instanceof qx.core.Object) {
        item.dispose();
      }
    }

    this.__array = null;
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Each object, which should support single selection have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.core.ISingleSelection",
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
    /**
     * Returns an array of currently selected items.
     *
     * Note: The result is only a set of selected items, so the order can
     * differ from the sequence in which the items were added.
     *
     * @return {qx.ui.core.Widget[]} List of items.
     */
    getSelection : function() {
      return true;
    },

    /**
     * Replaces current selection with the given items.
     *
     * @param items {qx.ui.core.Widget[]} Items to select.
     * @throws an exception if the item is not a child element.
     */
    setSelection : function(items) {
      return arguments.length == 1;
    },

    /**
     * Clears the whole selection at once.
     */
    resetSelection : function() {
      return true;
    },

    /**
     * Detects whether the given item is currently selected.
     *
     * @param item {qx.ui.core.Widget} Any valid selectable item
     * @return {Boolean} Whether the item is selected.
     * @throws an exception if the item is not a child element.
     */
    isSelected : function(item) {
      return arguments.length == 1;
    },

    /**
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty.
     */
    isSelectionEmpty : function() {
      return true;
    },

    /**
     * Returns all elements which are selectable.
     *
     * @param all {boolean} true for all selectables, false for the
     *   selectables the user can interactively select
     * @return {qx.ui.core.Widget[]} The contained items.
     */
    getSelectables: function(all) {
      return arguments.length == 1;
    }
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Each object, which should support multiselection selection have to
 * implement this interface.
 */
qx.Interface.define("qx.ui.core.IMultiSelection",
{
  extend: qx.ui.core.ISingleSelection,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /**
     * Selects all items of the managed object.
     */
    selectAll : function() {
      return true;
    },

    /**
     * Adds the given item to the existing selection.
     *
     * @param item {qx.ui.core.Widget} Any valid item
     * @throws an exception if the item is not a child element.
     */
    addToSelection : function(item) {
      return arguments.length == 1;
    },

    /**
     * Removes the given item from the selection.
     *
     * Use {@link qx.ui.core.ISingleSelection#resetSelection} when you
     * want to clear the whole selection at once.
     *
     * @param item {qx.ui.core.Widget} Any valid item
     * @throws an exception if the item is not a child element.
     */
    removeFromSelection : function(item) {
      return arguments.length == 1;
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin holding the handler for the two axis mouse wheel scrolling. Please
 * keep in mind that the including widget has to have the scroll bars
 * implemented as child controls named <code>scrollbar-x</code> and
 * <code>scrollbar-y</code> to get the handler working. Also, you have to
 * attach the listener yourself.
 */
qx.Mixin.define("qx.ui.core.scroll.MWheelHandling",
{
  members :
  {
    /**
     * Mouse wheel event handler
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onMouseWheel : function(e)
    {
      var showX = this._isChildControlVisible("scrollbar-x");
      var showY = this._isChildControlVisible("scrollbar-y");

      var scrollbarY = showY ? this.getChildControl("scrollbar-y", true) : null;
      var scrollbarX = showX ? this.getChildControl("scrollbar-x", true) : null;

      var deltaY = e.getWheelDelta("y");
      var deltaX = e.getWheelDelta("x");

      var endY = !showY;
      var endX = !showX;

      // y case
      if (scrollbarY) {
        var steps = parseInt(deltaY);

        if (steps !== 0) {
          scrollbarY.scrollBySteps(steps);
        }

        var position = scrollbarY.getPosition();
        var max = scrollbarY.getMaximum();

        // pass the event to the parent if the scrollbar is at an edge
        if (steps < 0 && position <= 0 || steps > 0 && position >= max) {
          endY = true;
        }
      }

      // x case
      if (scrollbarX) {
        var steps = parseInt(deltaX);

        if (steps !== 0) {
          scrollbarX.scrollBySteps(steps);
        }

        var position = scrollbarX.getPosition();
        var max = scrollbarX.getMaximum();
        // pass the event to the parent if the scrollbar is at an edge
        if (steps < 0 && position <= 0 || steps > 0 && position >= max) {
          endX = true;
        }
      }

      // pass the event to the parent if both scrollbars are at the end
      if (!endY || !endX) {
        // Stop bubbling and native event only if a scrollbar is visible
        e.stop();
      }
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.core.Environment.add("qx.nativeScrollBars", false);

/**
 * Include this widget if you want to create scrollbars depending on the global
 * "qx.nativeScrollBars" setting.
 */
qx.Mixin.define("qx.ui.core.scroll.MScrollBarFactory",
{
  members :
  {
    /**
     * Creates a new scrollbar. This can either be a styled qooxdoo scrollbar
     * or a native browser scrollbar.
     *
     * @param orientation {String?"horizontal"} The initial scroll bar orientation
     * @return {qx.ui.core.scroll.IScrollBar} The scrollbar instance
     */
    _createScrollBar : function(orientation)
    {
      if (qx.core.Environment.get("qx.nativeScrollBars")) {
        return new qx.ui.core.scroll.NativeScrollBar(orientation);
      } else {
        return new qx.ui.core.scroll.ScrollBar(orientation);
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
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * All widget used as scrollbars must implement this interface.
 */
qx.Interface.define("qx.ui.core.scroll.IScrollBar",
{
  events :
  {
    /** Fired if the user scroll */
    "scroll" : "qx.event.type.Data"
  },


  properties :
  {
    /**
     * The scroll bar orientation
     */
    orientation : {},


    /**
     * The maximum value (difference between available size and
     * content size).
     */
    maximum : {},


    /**
     * Position of the scrollbar (which means the scroll left/top of the
     * attached area's pane)
     *
     * Strictly validates according to {@link #maximum}.
     * Does not apply any correction to the incoming value. If you depend
     * on this, please use {@link #scrollTo} instead.
     */
    position : {},


    /**
     * Factor to apply to the width/height of the knob in relation
     * to the dimension of the underlying area.
     */
    knobFactor : {}
  },


  members :
  {
    /**
     * Scrolls to the given position.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param position {Integer} Scroll to this position. Must be greater zero.
     * @return {void}
     */
    scrollTo : function(position) {
      this.assertNumber(position);
    },


    /**
     * Scrolls by the given offset.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param offset {Integer} Scroll by this offset
     * @return {void}
     */
    scrollBy : function(offset) {
      this.assertNumber(offset);
    },


    /**
     * Scrolls by the given number of steps.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param steps {Integer} Number of steps
     * @return {void}
     */
    scrollBySteps : function(steps) {
      this.assertNumber(steps);
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The scroll bar widget wraps the native browser scroll bars as a qooxdoo widget.
 * It can be uses instead of the styled qooxdoo scroll bars.
 *
 * Scroll bars are used by the {@link qx.ui.container.Scroll} container. Usually
 * a scroll bar is not used directly.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var scrollBar = new qx.ui.core.scroll.NativeScrollBar("horizontal");
 *   scrollBar.set({
 *     maximum: 500
 *   })
 *   this.getRoot().add(scrollBar);
 * </pre>
 *
 * This example creates a horizontal scroll bar with a maximum value of 500.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/scrollbar.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.core.scroll.NativeScrollBar",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.core.scroll.IScrollBar,


  /**
   * @param orientation {String?"horizontal"} The initial scroll bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    this.addState("native");

    this.getContentElement().addListener("scroll", this._onScroll, this);
    this.addListener("mousedown", this._stopPropagation, this);
    this.addListener("mouseup", this._stopPropagation, this);
    this.addListener("mousemove", this._stopPropagation, this);
    this.addListener("appear", this._onAppear, this);

    this.getContentElement().add(this._getScrollPaneElement());

    // Configure orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "scrollbar"
    },


    // interface implementation
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    // interface implementation
    maximum :
    {
      check : "PositiveInteger",
      apply : "_applyMaximum",
      init : 100
    },


    // interface implementation
    position :
    {
      check : "Number",
      init : 0,
      apply : "_applyPosition",
      event : "scroll"
    },


    /**
     * Step size for each click on the up/down or left/right buttons.
     */
    singleStep :
    {
      check : "Integer",
      init : 20
    },


    // interface implementation
    knobFactor :
    {
      check : "PositiveNumber",
      nullable : true
    }
  },


  members :
  {
    __isHorizontal : null,
    __scrollPaneElement : null,

    /**
     * Get the scroll pane html element.
     *
     * @return {qx.html.Element} The element
     */
    _getScrollPaneElement : function()
    {
      if (!this.__scrollPaneElement) {
        this.__scrollPaneElement = new qx.html.Element();
      }
      return this.__scrollPaneElement;
    },

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(left, top, width, height)
    {
      var changes = this.base(arguments, left, top, width, height);

      this._updateScrollBar();
      return changes;
    },


    // overridden
    _getContentHint : function()
    {
      var scrollbarWidth = qx.bom.element.Overflow.getScrollbarWidth();
      return {
        width: this.__isHorizontal ? 100 : scrollbarWidth,
        maxWidth: this.__isHorizontal ? null : scrollbarWidth,
        minWidth: this.__isHorizontal ? null : scrollbarWidth,
        height: this.__isHorizontal ? scrollbarWidth : 100,
        maxHeight: this.__isHorizontal ? scrollbarWidth : null,
        minHeight: this.__isHorizontal ? scrollbarWidth : null
      }
    },


    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);
      this._updateScrollBar();
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaximum : function(value) {
      this._updateScrollBar();
    },


    // property apply
    _applyPosition : function(value)
    {
      var content = this.getContentElement();

      if (this.__isHorizontal) {
        content.scrollToX(value)
      } else {
        content.scrollToY(value);
      }
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var isHorizontal = this.__isHorizontal = value === "horizontal";

      this.set({
        allowGrowX : isHorizontal,
        allowShrinkX : isHorizontal,
        allowGrowY : !isHorizontal,
        allowShrinkY : !isHorizontal
      });

      if (isHorizontal) {
        this.replaceState("vertical", "horizontal");
      } else {
        this.replaceState("horizontal", "vertical");
      }

      this.getContentElement().setStyles({
        overflowX: isHorizontal ? "scroll" : "hidden",
        overflowY: isHorizontal ? "hidden" : "scroll"
      });

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Update the scroll bar according to its current size, max value and
     * enabled state.
     */
    _updateScrollBar : function()
    {
      var isHorizontal = this.__isHorizontal;

      var bounds = this.getBounds();
      if (!bounds) {
        return;
      }

      if (this.isEnabled())
      {
        var containerSize = isHorizontal ? bounds.width : bounds.height;
        var innerSize = this.getMaximum() + containerSize;
      } else {
        innerSize = 0;
      }

      // Scrollbars don't work properly in IE if the element with overflow has
      // excatly the size of the scrollbar. Thus we move the element one pixel
      // out of the view and increase the size by one.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        var bounds = this.getBounds();
        this.getContentElement().setStyles({
          left: isHorizontal ? "0" : "-1px",
          top: isHorizontal ? "-1px" : "0",
          width: (isHorizontal ? bounds.width : bounds.width + 1) + "px",
          height: (isHorizontal ? bounds.height + 1 : bounds.height) + "px"
        });
      }

      this._getScrollPaneElement().setStyles({
        left: 0,
        top: 0,
        width: (isHorizontal ? innerSize : 1) + "px",
        height: (isHorizontal ? 1 : innerSize) + "px"
      });

      this.scrollTo(this.getPosition());
    },


    // interface implementation
    scrollTo : function(position) {
      this.setPosition(Math.max(0, Math.min(this.getMaximum(), position)));
    },


    // interface implementation
    scrollBy : function(offset) {
      this.scrollTo(this.getPosition() + offset)
    },


    // interface implementation
    scrollBySteps : function(steps)
    {
      var size = this.getSingleStep();
      this.scrollBy(steps * size);
    },


    /**
     * Scroll event handler
     *
     * @param e {qx.event.type.Event} the scroll event
     */
    _onScroll : function(e)
    {
      var container = this.getContentElement();
      var position = this.__isHorizontal ? container.getScrollX() : container.getScrollY();
      this.setPosition(position);
    },


    /**
     * Listener for appear which ensured the scroll bar is positioned right
     * on appear.
     *
     * @param e {qx.event.type.Data} Incoming event object
     */
    _onAppear : function(e) {
      this._applyPosition(this.getPosition());
    },


    /**
     * Stops propagation on the given even
     *
     * @param e {qx.event.type.Event} the event
     */
    _stopPropagation : function(e) {
      e.stopPropagation();
    }
  },


  destruct : function() {
    this._disposeObjects("__scrollPaneElement");
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
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The scroll bar widget, is a special slider, which is used in qooxdoo instead
 * of the native browser scroll bars.
 *
 * Scroll bars are used by the {@link qx.ui.container.Scroll} container. Usually
 * a scroll bar is not used directly.
 *
 * @childControl slider {qx.ui.core.scroll.ScrollSlider} scroll slider component
 * @childControl button-begin {qx.ui.form.RepeatButton} button to scroll to top
 * @childControl button-end {qx.ui.form.RepeatButton} button to scroll to bottom
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var scrollBar = new qx.ui.core.scroll.ScrollBar("horizontal");
 *   scrollBar.set({
 *     maximum: 500
 *   })
 *   this.getRoot().add(scrollBar);
 * </pre>
 *
 * This example creates a horizontal scroll bar with a maximum value of 500.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/scrollbar.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.core.scroll.ScrollBar",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.core.scroll.IScrollBar,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} The initial scroll bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    // Create child controls
    this._createChildControl("button-begin");
    this._createChildControl("slider").addListener("resize", this._onResizeSlider, this);
    this._createChildControl("button-end");

    // Configure orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
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
      init : "scrollbar"
    },


    /**
     * The scroll bar orientation
     */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    /**
     * The maximum value (difference between available size and
     * content size).
     */
    maximum :
    {
      check : "PositiveInteger",
      apply : "_applyMaximum",
      init : 100
    },


    /**
     * Position of the scrollbar (which means the scroll left/top of the
     * attached area's pane)
     *
     * Strictly validates according to {@link #maximum}.
     * Does not apply any correction to the incoming value. If you depend
     * on this, please use {@link #scrollTo} instead.
     */
    position :
    {
      check : "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getMaximum()",
      init : 0,
      apply : "_applyPosition",
      event : "scroll"
    },


    /**
     * Step size for each click on the up/down or left/right buttons.
     */
    singleStep :
    {
      check : "Integer",
      init : 20
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
     */
    pageStep :
    {
      check : "Integer",
      init : 10,
      apply : "_applyPageStep"
    },


    /**
     * Factor to apply to the width/height of the knob in relation
     * to the dimension of the underlying area.
     */
    knobFactor :
    {
      check : "PositiveNumber",
      apply : "_applyKnobFactor",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __offset : 2,
    __originalMinSize : 0,


    // overridden
    _computeSizeHint : function() {
      var hint = this.base(arguments);
      if (this.getOrientation() === "horizontal") {
        this.__originalMinSize = hint.minWidth;
        hint.minWidth = 0;
      } else {
        this.__originalMinSize = hint.minHeight;
        hint.minHeight = 0;
      }
      return hint;
    },


    // overridden
    renderLayout : function(left, top, width, height) {
      var changes = this.base(arguments, left, top, width, height);
      var horizontal = this.getOrientation() === "horizontal";
      if (this.__originalMinSize >= (horizontal ? width : height)) {
        this.getChildControl("button-begin").setVisibility("hidden");
        this.getChildControl("button-end").setVisibility("hidden");
      } else {
        this.getChildControl("button-begin").setVisibility("visible");
        this.getChildControl("button-end").setVisibility("visible");
      }

      return changes
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "slider":
          control = new qx.ui.core.scroll.ScrollSlider();
          control.setPageStep(100);
          control.setFocusable(false);
          control.addListener("changeValue", this._onChangeSliderValue, this);
          this._add(control, {flex: 1});
          break;

        case "button-begin":
          // Top/Left Button
          control = new qx.ui.form.RepeatButton();
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteBegin, this);
          this._add(control);
          break;

        case "button-end":
          // Bottom/Right Button
          control = new qx.ui.form.RepeatButton();
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteEnd, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaximum : function(value) {
      this.getChildControl("slider").setMaximum(value);
    },


    // property apply
    _applyPosition : function(value) {
      this.getChildControl("slider").setValue(value);
    },


    // property apply
    _applyKnobFactor : function(value) {
      this.getChildControl("slider").setKnobFactor(value);
    },


    // property apply
    _applyPageStep : function(value) {
      this.getChildControl("slider").setPageStep(value);
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      // Dispose old layout
      var oldLayout = this._getLayout();
      if (oldLayout) {
        oldLayout.dispose();
      }

      // Reconfigure
      if (value === "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());

        this.setAllowStretchX(true);
        this.setAllowStretchY(false);

        this.replaceState("vertical", "horizontal");

        this.getChildControl("button-begin").replaceState("up", "left");
        this.getChildControl("button-end").replaceState("down", "right");
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());

        this.setAllowStretchX(false);
        this.setAllowStretchY(true);

        this.replaceState("horizontal", "vertical");

        this.getChildControl("button-begin").replaceState("left", "up");
        this.getChildControl("button-end").replaceState("right", "down");
      }

      // Sync slider orientation
      this.getChildControl("slider").setOrientation(value);
    },





    /*
    ---------------------------------------------------------------------------
      METHOD REDIRECTION TO SLIDER
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls to the given position.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param position {Integer} Scroll to this position. Must be greater zero.
     * @return {void}
     */
    scrollTo : function(position) {
      this.getChildControl("slider").slideTo(position);
    },


    /**
     * Scrolls by the given offset.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param offset {Integer} Scroll by this offset
     * @return {void}
     */
    scrollBy : function(offset) {
      this.getChildControl("slider").slideBy(offset);
    },


    /**
     * Scrolls by the given number of steps.
     *
     * This method automatically corrects the given position to respect
     * the {@link #maximum}.
     *
     * @param steps {Integer} Number of steps
     * @return {void}
     */
    scrollBySteps : function(steps)
    {
      var size = this.getSingleStep();
      this.getChildControl("slider").slideBy(steps * size);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Executed when the up/left button is executed (pressed)
     *
     * @param e {qx.event.type.Event} Execute event of the button
     * @return {void}
     */
    _onExecuteBegin : function(e) {
      this.scrollBy(-this.getSingleStep());
    },


    /**
     * Executed when the down/right button is executed (pressed)
     *
     * @param e {qx.event.type.Event} Execute event of the button
     * @return {void}
     */
    _onExecuteEnd : function(e) {
      this.scrollBy(this.getSingleStep());
    },


    /**
     * Change listener for slider value changes.
     *
     * @param e {qx.event.type.Data} The change event object
     * @return {void}
     */
    _onChangeSliderValue : function(e) {
      this.setPosition(e.getData());
    },

    /**
     * Hide the knob of the slider if the slidebar is too small or show it
     * otherwise.
     *
     * @param e {qx.event.type.Data} event object
     */
    _onResizeSlider : function(e)
    {
      var knob = this.getChildControl("slider").getChildControl("knob");
      var knobHint = knob.getSizeHint();
      var hideKnob = false;
      var sliderSize = this.getChildControl("slider").getInnerSize();

      if (this.getOrientation() == "vertical")
      {
        if (sliderSize.height  < knobHint.minHeight + this.__offset) {
          hideKnob = true;
        }
      }
      else
      {
        if (sliderSize.width  < knobHint.minWidth + this.__offset) {
          hideKnob = true;
        }
      }

      if (hideKnob) {
        knob.exclude();
      } else {
        knob.show();
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Form interface for all widgets which deal with ranges. The spinner is a good
 * example for a range using widget.
 */
qx.Interface.define("qx.ui.form.IRange",
{

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      MINIMUM PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Set the minimum value of the range.
     *
     * @param min {Number} The minimum.
     */
    setMinimum : function(min) {
      return arguments.length == 1;
    },


    /**
     * Return the current set minimum of the range.
     *
     * @return {Number} The current set minimum.
     */
    getMinimum : function() {},


    /*
    ---------------------------------------------------------------------------
      MAXIMUM PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Set the maximum value of the range.
     *
     * @param max {Number} The maximum.
     */
    setMaximum : function(max) {
      return arguments.length == 1;
    },


    /**
     * Return the current set maximum of the range.
     *
     * @return {Number} The current set maximum.
     */
    getMaximum : function() {},


    /*
    ---------------------------------------------------------------------------
      SINGLESTEP PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value for single steps in the range.
     *
     * @param step {Number} The value of the step.
     */
    setSingleStep : function(step) {
      return arguments.length == 1;
    },


    /**
     * Returns the value which will be stepped in a single step in the range.
     *
     * @return {Number} The current value for single steps.
     */
    getSingleStep : function() {},


    /*
    ---------------------------------------------------------------------------
      PAGESTEP PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value for page steps in the range.
     *
     * @param step {Number} The value of the step.
     */
    setPageStep : function(step) {
      return arguments.length == 1;
    },


    /**
     * Returns the value which will be stepped in a page step in the range.
     *
     * @return {Number} The current value for page steps.
     */
    getPageStep : function() {}
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
 * Form interface for all form widgets which use a numeric value as their
 * primary data type like a spinner.
 */
qx.Interface.define("qx.ui.form.INumberForm",
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
     * @param value {Number|null} The new value of the element.
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
     * @return {Number|null} The value.
     */
    getValue : function() {}
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
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The Slider widget provides a vertical or horizontal slider.
 *
 * The Slider is the classic widget for controlling a bounded value.
 * It lets the user move a slider handle along a horizontal or vertical
 * groove and translates the handle's position into an integer value
 * within the defined range.
 *
 * The Slider has very few of its own functions.
 * The most useful functions are slideTo() to set the slider directly to some
 * value; setSingleStep(), setPageStep() to set the steps; and setMinimum()
 * and setMaximum() to define the range of the slider.
 *
 * A slider accepts focus on Tab and provides both a mouse wheel and
 * a keyboard interface. The keyboard interface is the following:
 *
 * * Left/Right move a horizontal slider by one single step.
 * * Up/Down move a vertical slider by one single step.
 * * PageUp moves up one page.
 * * PageDown moves down one page.
 * * Home moves to the start (minimum).
 * * End moves to the end (maximum).
 *
 * Here are the main properties of the class:
 *
 * # <code>value</code>: The bounded integer that {@link qx.ui.form.INumberForm}
 * maintains.
 * # <code>minimum</code>: The lowest possible value.
 * # <code>maximum</code>: The highest possible value.
 * # <code>singleStep</code>: The smaller of two natural steps that an abstract
 * sliders provides and typically corresponds to the user pressing an arrow key.
 * # <code>pageStep</code>: The larger of two natural steps that an abstract
 * slider provides and typically corresponds to the user pressing PageUp or
 * PageDown.
 *
 * @childControl knob {qx.ui.core.Widget} knob to set the value of the slider
 */
qx.Class.define("qx.ui.form.Slider",
{
  extend : qx.ui.core.Widget,
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.INumberForm,
    qx.ui.form.IRange
  ],
  include : [qx.ui.form.MForm],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} Configure the
   * {@link #orientation} property
   */
  construct : function(orientation)
  {
    this.base(arguments);

    // Force canvas layout
    this._setLayout(new qx.ui.layout.Canvas());

    // Add listeners
    this.addListener("keypress", this._onKeyPress);
    this.addListener("mousewheel", this._onMouseWheel);
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("losecapture", this._onMouseUp);
    this.addListener("resize", this._onUpdate);

    // Stop events
    this.addListener("contextmenu", this._onStopEvent);
    this.addListener("click", this._onStopEvent);
    this.addListener("dblclick", this._onStopEvent);

    // Initialize orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     * Change event for the value.
     */
    changeValue: 'qx.event.type.Data'
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
      init : "slider"
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    /** Whether the slider is horizontal or vertical. */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    /**
     * The current slider value.
     *
     * Strictly validates according to {@link #minimum} and {@link #maximum}.
     * Do not apply any value correction to the incoming value. If you depend
     * on this, please use {@link #slideTo} instead.
     */
    value :
    {
      check : "typeof value==='number'&&value>=this.getMinimum()&&value<=this.getMaximum()",
      init : 0,
      apply : "_applyValue",
      nullable: true
    },


    /**
     * The minimum slider value (may be negative). This value must be smaller
     * than {@link #maximum}.
     */
    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMinimum",
      event: "changeMinimum"
    },


    /**
     * The maximum slider value (may be negative). This value must be larger
     * than {@link #minimum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_applyMaximum",
      event : "changeMaximum"
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user pressing an arrow key.
     */
    singleStep :
    {
      check : "Integer",
      init : 1
    },


    /**
     * The amount to increment on each event. Typically corresponds
     * to the user pressing <code>PageUp</code> or <code>PageDown</code>.
     */
    pageStep :
    {
      check : "Integer",
      init : 10
    },


    /**
     * Factor to apply to the width/height of the knob in relation
     * to the dimension of the underlying area.
     */
    knobFactor :
    {
      check : "Number",
      apply : "_applyKnobFactor",
      nullable : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __sliderLocation : null,
    __knobLocation : null,
    __knobSize : null,
    __dragMode : null,
    __dragOffset : null,
    __trackingMode : null,
    __trackingDirection : null,
    __trackingEnd : null,
    __timer : null,

    // event delay stuff during drag
    __dragTimer: null,
    __lastValueEvent: null,
    __dragValue: null,

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      invalid : true
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "knob":
          control = new qx.ui.core.Widget();

          control.addListener("resize", this._onUpdate, this);
          control.addListener("mouseover", this._onMouseOver);
          control.addListener("mouseout", this._onMouseOut);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Event handler for mouseover events at the knob child control.
     *
     * Adds the 'hovered' state
     *
     * @param e {qx.event.type.Mouse} Incoming mouse event
     */
    _onMouseOver : function(e) {
      this.addState("hovered");
    },


    /**
     * Event handler for mouseout events at the knob child control.
     *
     * Removes the 'hovered' state
     *
     * @param e {qx.event.type.Mouse} Incoming mouse event
     */
    _onMouseOut : function(e) {
      this.removeState("hovered");
    },


    /**
     * Listener of mousewheel event
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseWheel : function(e)
    {
      var axis = this.getOrientation() === "horizontal" ? "x" : "y";
      var delta = e.getWheelDelta(axis);
      var direction =  delta > 0 ? 1 : delta < 0 ? -1 : 0;
      this.slideBy(direction * this.getSingleStep());

      e.stop();
    },


    /**
     * Event handler for keypress events.
     *
     * Adds support for arrow keys, page up, page down, home and end keys.
     *
     * @param e {qx.event.type.KeySequence} Incoming keypress event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";
      var backward = isHorizontal ? "Left" : "Up";
      var forward = isHorizontal ? "Right" : "Down";

      switch(e.getKeyIdentifier())
      {
        case forward:
          this.slideForward();
          break;

        case backward:
          this.slideBack();
          break;

        case "PageDown":
          this.slidePageForward();
          break;

        case "PageUp":
          this.slidePageBack();
          break;

        case "Home":
          this.slideToBegin();
          break;

        case "End":
          this.slideToEnd();
          break;

        default:
          return;
      }

      // Stop processed events
      e.stop();
    },


    /**
     * Listener of mousedown event. Initializes drag or tracking mode.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseDown : function(e)
    {
      // this can happen if the user releases the button while dragging outside
      // of the browser viewport
      if (this.__dragMode) {
        return;
      }

      var isHorizontal = this.__isHorizontal;
      var knob = this.getChildControl("knob");

      var locationProperty = isHorizontal ? "left" : "top";

      var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
      var sliderLocation = this.__sliderLocation = qx.bom.element.Location.get(this.getContentElement().getDomElement())[locationProperty];
      var knobLocation = this.__knobLocation = qx.bom.element.Location.get(knob.getContainerElement().getDomElement())[locationProperty];

      if (e.getTarget() === knob)
      {
        // Switch into drag mode
        this.__dragMode = true;
        if (!this.__dragTimer){
          // create a timer to fire delayed dragging events if dragging stops.
          this.__dragTimer = new qx.event.Timer(100);
          this.__dragTimer.addListener("interval", this._fireValue, this);
        }
        this.__dragTimer.start();
        // Compute dragOffset (includes both: inner position of the widget and
        // cursor position on knob)
        this.__dragOffset = cursorLocation + sliderLocation - knobLocation;

        // add state
        knob.addState("pressed");
      }
      else
      {
        // Switch into tracking mode
        this.__trackingMode = true;

        // Detect tracking direction
        this.__trackingDirection = cursorLocation <= knobLocation ? -1 : 1;

        // Compute end value
        this.__computeTrackingEnd(e);

        // Directly call interval method once
        this._onInterval();

        // Initialize timer (when needed)
        if (!this.__timer)
        {
          this.__timer = new qx.event.Timer(100);
          this.__timer.addListener("interval", this._onInterval, this);
        }

        // Start timer
        this.__timer.start();
      }

      // Register move listener
      this.addListener("mousemove", this._onMouseMove);

      // Activate capturing
      this.capture();

      // Stop event
      e.stopPropagation();
    },


    /**
     * Listener of mouseup event. Used for cleanup of previously
     * initialized modes.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseUp : function(e)
    {
      if (this.__dragMode)
      {
        // Release capture mode
        this.releaseCapture();

        // Cleanup status flags
        delete this.__dragMode;

        // as we come out of drag mode, make
        // sure content gets synced
        this.__dragTimer.stop();
        this._fireValue();

        delete this.__dragOffset;

        // remove state
        this.getChildControl("knob").removeState("pressed");

        // it's necessary to check whether the mouse cursor is over the knob widget to be able to
        // to decide whether to remove the 'hovered' state.
        if (e.getType() === "mouseup")
        {
          var deltaSlider;
          var deltaPosition;
          var positionSlider;

          if (this.__isHorizontal)
          {
            deltaSlider = e.getDocumentLeft() - (this._valueToPosition(this.getValue()) + this.__sliderLocation);

            positionSlider = qx.bom.element.Location.get(this.getContentElement().getDomElement())["top"];
            deltaPosition = e.getDocumentTop() - (positionSlider + this.getChildControl("knob").getBounds().top);
          }
          else
          {
            deltaSlider = e.getDocumentTop() - (this._valueToPosition(this.getValue()) + this.__sliderLocation);

            positionSlider = qx.bom.element.Location.get(this.getContentElement().getDomElement())["left"];
            deltaPosition = e.getDocumentLeft() - (positionSlider + this.getChildControl("knob").getBounds().left);
          }

          if (deltaPosition < 0 || deltaPosition > this.__knobSize ||
              deltaSlider < 0 || deltaSlider > this.__knobSize) {
            this.getChildControl("knob").removeState("hovered");
          }
        }

      }
      else if (this.__trackingMode)
      {
        // Stop timer interval
        this.__timer.stop();

        // Release capture mode
        this.releaseCapture();

        // Cleanup status flags
        delete this.__trackingMode;
        delete this.__trackingDirection;
        delete this.__trackingEnd;
      }

      // Remove move listener again
      this.removeListener("mousemove", this._onMouseMove);

      // Stop event
      if (e.getType() === "mouseup") {
        e.stopPropagation();
      }
    },


    /**
     * Listener of mousemove event for the knob. Only used in drag mode.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     * @return {void}
     */
    _onMouseMove : function(e)
    {
      if (this.__dragMode)
      {
        var dragStop = this.__isHorizontal ?
          e.getDocumentLeft() : e.getDocumentTop();
        var position = dragStop - this.__dragOffset;

        this.slideTo(this._positionToValue(position));
      }
      else if (this.__trackingMode)
      {
        // Update tracking end on mousemove
        this.__computeTrackingEnd(e);
      }

      // Stop event
      e.stopPropagation();
    },


    /**
     * Listener of interval event by the internal timer. Only used
     * in tracking sequences.
     *
     * @param e {qx.event.type.Event} Incoming event object
     * @return {void}
     */
    _onInterval : function(e)
    {
      // Compute new value
      var value = this.getValue() + (this.__trackingDirection * this.getPageStep());

      // Limit value
      if (value < this.getMinimum()) {
        value = this.getMinimum();
      } else if (value > this.getMaximum()) {
        value = this.getMaximum();
      }

      // Stop at tracking position (where the mouse is pressed down)
      var slideBack = this.__trackingDirection == -1;
      if ((slideBack && value <= this.__trackingEnd) || (!slideBack && value >= this.__trackingEnd)) {
        value = this.__trackingEnd;
      }

      // Finally slide to the desired position
      this.slideTo(value);
    },


    /**
     * Listener of resize event for both the slider itself and the knob.
     *
     * @param e {qx.event.type.Data} Incoming event object
     * @return {void}
     */
    _onUpdate : function(e)
    {
      // Update sliding space
      var availSize = this.getInnerSize();
      var knobSize = this.getChildControl("knob").getBounds();
      var sizeProperty = this.__isHorizontal ? "width" : "height";

      // Sync knob size
      this._updateKnobSize();

      // Store knob size
      this.__slidingSpace = availSize[sizeProperty] - knobSize[sizeProperty];
      this.__knobSize = knobSize[sizeProperty];

      // Update knob position (sliding space must be updated first)
      this._updateKnobPosition();
    },






    /*
    ---------------------------------------------------------------------------
      UTILS
    ---------------------------------------------------------------------------
    */

    /** {Boolean} Whether the slider is laid out horizontally */
    __isHorizontal : false,


    /**
     * {Integer} Available space for knob to slide on, computed on resize of
     * the widget
     */
    __slidingSpace : 0,


    /**
     * Computes the value where the tracking should end depending on
     * the current mouse position.
     *
     * @param e {qx.event.type.Mouse} Incoming mouse event
     * @return {void}
     */
    __computeTrackingEnd : function(e)
    {
      var isHorizontal = this.__isHorizontal;
      var cursorLocation = isHorizontal ? e.getDocumentLeft() : e.getDocumentTop();
      var sliderLocation = this.__sliderLocation;
      var knobLocation = this.__knobLocation;
      var knobSize = this.__knobSize;

      // Compute relative position
      var position = cursorLocation - sliderLocation;
      if (cursorLocation >= knobLocation) {
        position -= knobSize;
      }

      // Compute stop value
      var value = this._positionToValue(position);

      var min = this.getMinimum();
      var max = this.getMaximum();

      if (value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      } else {
        var old = this.getValue();
        var step = this.getPageStep();
        var method = this.__trackingDirection < 0 ? "floor" : "ceil";

        // Fix to page step
        value = old + (Math[method]((value - old) / step) * step);
      }

      // Store value when undefined, otherwise only when it follows the
      // current direction e.g. goes up or down
      if (this.__trackingEnd == null || (this.__trackingDirection == -1 && value <= this.__trackingEnd) || (this.__trackingDirection == 1 && value >= this.__trackingEnd)) {
        this.__trackingEnd = value;
      }
    },


    /**
     * Converts the given position to a value.
     *
     * Does not respect single or page step.
     *
     * @param position {Integer} Position to use
     * @return {Integer} Resulting value (rounded)
     */
    _positionToValue : function(position)
    {
      // Reading available space
      var avail = this.__slidingSpace;

      // Protect undefined value (before initial resize) and division by zero
      if (avail == null || avail == 0) {
        return 0;
      }

      // Compute and limit percent
      var percent = position / avail;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }

      // Compute range
      var range = this.getMaximum() - this.getMinimum();

      // Compute value
      return this.getMinimum() + Math.round(range * percent);
    },


    /**
     * Converts the given value to a position to place
     * the knob to.
     *
     * @param value {Integer} Value to use
     * @return {Integer} Computed position (rounded)
     */
    _valueToPosition : function(value)
    {
      // Reading available space
      var avail = this.__slidingSpace;
      if (avail == null) {
        return 0;
      }

      // Computing range
      var range = this.getMaximum() - this.getMinimum();

      // Protect division by zero
      if (range == 0) {
        return 0;
      }

      // Translating value to distance from minimum
      var value = value - this.getMinimum();

      // Compute and limit percent
      var percent = value / range;
      if (percent < 0) {
        percent = 0;
      } else if (percent > 1) {
        percent = 1;
      }

      // Compute position from available space and percent
      return Math.round(avail * percent);
    },


    /**
     * Updates the knob position following the currently configured
     * value. Useful on reflows where the dimensions of the slider
     * itself have been modified.
     *
     * @return {void}
     */
    _updateKnobPosition : function() {
      this._setKnobPosition(this._valueToPosition(this.getValue()));
    },


    /**
     * Moves the knob to the given position.
     *
     * @param position {Integer} Any valid position (needs to be
     *   greater or equal than zero)
     * @return {void}
     */
    _setKnobPosition : function(position)
    {
      // Use DOM Element
      var container = this.getChildControl("knob").getContainerElement();
      if (this.__isHorizontal) {
        container.setStyle("left", position+"px", true);
      } else {
        container.setStyle("top", position+"px", true);
      }

      // Alternative: Use layout system
      // Not used because especially in IE7/Firefox2 the
      // direct element manipulation is a lot faster

      /*
      if (this.__isHorizontal) {
        this.getChildControl("knob").setLayoutProperties({left:position});
      } else {
        this.getChildControl("knob").setLayoutProperties({top:position});
      }
      */
    },


    /**
     * Reconfigures the size of the knob depending on
     * the optionally defined {@link #knobFactor}.
     *
     * @return {void}
     */
    _updateKnobSize : function()
    {
      // Compute knob size
      var knobFactor = this.getKnobFactor();
      if (knobFactor == null) {
        return;
      }

      // Ignore when not rendered yet
      var avail = this.getInnerSize();
      if (avail == null) {
        return;
      }

      // Read size property
      if (this.__isHorizontal) {
        this.getChildControl("knob").setWidth(Math.round(knobFactor * avail.width));
      } else {
        this.getChildControl("knob").setHeight(Math.round(knobFactor * avail.height));
      }
    },





    /*
    ---------------------------------------------------------------------------
      SLIDE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Slides backward to the minimum value
     *
     * @return {void}
     */
    slideToBegin : function() {
      this.slideTo(this.getMinimum());
    },


    /**
     * Slides forward to the maximum value
     *
     * @return {void}
     */
    slideToEnd : function() {
      this.slideTo(this.getMaximum());
    },


    /**
     * Slides forward (right or bottom depending on orientation)
     *
     * @return {void}
     */
    slideForward : function() {
      this.slideBy(this.getSingleStep());
    },


    /**
     * Slides backward (to left or top depending on orientation)
     *
     * @return {void}
     */
    slideBack : function() {
      this.slideBy(-this.getSingleStep());
    },


    /**
     * Slides a page forward (to right or bottom depending on orientation)
     *
     * @return {void}
     */
    slidePageForward : function() {
      this.slideBy(this.getPageStep());
    },


    /**
     * Slides a page backward (to left or top depending on orientation)
     *
     * @return {void}
     */
    slidePageBack : function() {
      this.slideBy(-this.getPageStep());
    },


    /**
     * Slides by the given offset.
     *
     * This method works with the value, not with the coordinate.
     *
     * @param offset {Integer} Offset to scroll by
     * @return {void}
     */
    slideBy : function(offset) {
      this.slideTo(this.getValue() + offset);
    },


    /**
     * Slides to the given value
     *
     * This method works with the value, not with the coordinate.
     *
     * @param value {Integer} Scroll to a value between the defined
     *   minimum and maximum.
     * @return {void}
     */
    slideTo : function(value)
    {
      // Bring into allowed range or fix to single step grid
      if (value < this.getMinimum()) {
        value = this.getMinimum();
      } else if (value > this.getMaximum()) {
        value = this.getMaximum();
      } else {
        value = this.getMinimum() + Math.round((value - this.getMinimum()) / this.getSingleStep()) * this.getSingleStep()
      }

      // Sync with property
      this.setValue(value);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOrientation : function(value, old)
    {
      var knob = this.getChildControl("knob");

      // Update private flag for faster access
      this.__isHorizontal = value === "horizontal";

      // Toggle states and knob layout
      if (this.__isHorizontal)
      {
        this.removeState("vertical");
        knob.removeState("vertical");

        this.addState("horizontal");
        knob.addState("horizontal");

        knob.setLayoutProperties({top:0, right:null, bottom:0});
      }
      else
      {
        this.removeState("horizontal");
        knob.removeState("horizontal");

        this.addState("vertical");
        knob.addState("vertical");

        knob.setLayoutProperties({right:0, bottom:null, left:0});
      }

      // Sync knob position
      this._updateKnobPosition();
    },


    // property apply
    _applyKnobFactor : function(value, old)
    {
      if (value != null)
      {
        this._updateKnobSize();
      }
      else
      {
        if (this.__isHorizontal) {
          this.getChildControl("knob").resetWidth();
        } else {
          this.getChildControl("knob").resetHeight();
        }
      }
    },


    // property apply
    _applyValue : function(value, old) {
      if (value != null) {
        this._updateKnobPosition();
        if (this.__dragMode) {
          this.__dragValue = [value,old];
        } else {
          this.fireEvent("changeValue", qx.event.type.Data, [value,old]);
        }
      } else {
        this.resetValue();
      }
    },


    /**
     * Helper for applyValue which fires the changeValue event.
     */
    _fireValue: function(){
      if (!this.__dragValue){
        return;
      }
      var tmp = this.__dragValue;
      this.__dragValue = null;
      this.fireEvent("changeValue", qx.event.type.Data, tmp);
    },


    // property apply
    _applyMinimum : function(value, old)
    {
      if (this.getValue() < value) {
        this.setValue(value);
      }

      this._updateKnobPosition();
    },


    // property apply
    _applyMaximum : function(value, old)
    {
      if (this.getValue() > value) {
        this.setValue(value);
      }

      this._updateKnobPosition();
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
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Minimal modified version of the {@link qx.ui.form.Slider} to be
 * used by {@link qx.ui.core.scroll.ScrollBar}.
 *
 * @internal
 */
qx.Class.define("qx.ui.core.scroll.ScrollSlider",
{
  extend : qx.ui.form.Slider,

  // overridden
  construct : function(orientation)
  {
    this.base(arguments, orientation);

    // Remove mousewheel/keypress events
    this.removeListener("keypress", this._onKeyPress);
    this.removeListener("mousewheel", this._onMouseWheel);
  },


  members : {
    // overridden
    getSizeHint : function(compute) {
      // get the original size hint
      var hint = this.base(arguments);
      // set the width or height to 0 depending on the orientation.
      // this is necessary to prevent the ScrollSlider to change the size
      // hint of its parent, which can cause errors on outer flex layouts
      // [BUG #3279]
      if (this.getOrientation() === "horizontal") {
        hint.width = 0;
      } else {
        hint.height = 0;
      }
      return hint;
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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The RepeatButton is a special button, which fires repeatedly {@link #execute}
 * events, while the mouse button is pressed on the button. The initial delay
 * and the interval time can be set using the properties {@link #firstInterval}
 * and {@link #interval}. The {@link #execute} events will be fired in a shorter
 * amount of time if the mouse button is hold, until the min {@link #minTimer}
 * is reached. The {@link #timerDecrease} property sets the amount of milliseconds
 * which will decreased after every firing.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.form.RepeatButton("Hello World");
 *
 *   button.addListener("execute", function(e) {
 *     alert("Button is executed");
 *   }, this);
 *
 *   this.getRoot.add(button);
 * </pre>
 *
 * This example creates a button with the label "Hello World" and attaches an
 * event listener to the {@link #execute} event.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/repeatbutton.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.form.RepeatButton",
{
  extend : qx.ui.form.Button,


  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   */
  construct : function(label, icon)
  {
    this.base(arguments, label, icon);

    // create the timer and add the listener
    this.__timer = new qx.event.AcceleratingTimer();
    this.__timer.addListener("interval", this._onInterval, this);
  },


  events :
  {
    /**
     * This event gets dispatched with every interval. The timer gets executed
     * as long as the user holds down the mouse button.
     */
    "execute" : "qx.event.type.Event",

    /**
     * This event gets dispatched when the button is pressed.
     */
    "press"   : "qx.event.type.Event",

    /**
     * This event gets dispatched when the button is released.
     */
    "release" : "qx.event.type.Event"
  },


  properties :
  {
    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init  : 100
    },

    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init  : 500
    },

    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      check : "Integer",
      init  : 20
    },

    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      check : "Integer",
      init  : 2
    }
  },


  members :
  {
    __executed : null,
    __timer : null,


    /**
     * Calling this function is like a click from the user on the
     * button with all consequences.
     * <span style='color: red'>Be sure to call the {@link #release} function.</span>
     *
     * @return {void}
     */
    press : function()
    {
      // only if the button is enabled
      if (this.isEnabled())
      {
        // if the state pressed must be applied (first call)
        if (!this.hasState("pressed"))
        {
          // start the timer
          this.__startInternalTimer();
        }

        // set the states
        this.removeState("abandoned");
        this.addState("pressed");
      }
    },


    /**
     * Calling this function is like a release from the user on the
     * button with all consequences.
     * Usually the {@link #release} function will be called before the call of
     * this function.
     *
     * @param fireExecuteEvent {Boolean?true} flag which signals, if an event should be fired
     * @return {void}
     */
    release : function(fireExecuteEvent)
    {
      // only if the button is enabled
      if (!this.isEnabled()) {
        return;
      }

      // only if the button is pressed
      if (this.hasState("pressed"))
      {
        // if the button has not been executed
        if (!this.__executed) {
          this.execute();
        }
      }

      // remove button states
      this.removeState("pressed");
      this.removeState("abandoned");

      // stop the repeat timer and therefore the execution
      this.__stopInternalTimer();
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      if (!value)
      {
        // remove button states
        this.removeState("pressed");
        this.removeState("abandoned");

        // stop the repeat timer and therefore the execution
        this.__stopInternalTimer();
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for "mouseover" event
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
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
        this.__timer.start();
      }

      this.addState("hovered");
    },


    /**
     * Listener method for "mouseout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseOut : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
        this.__timer.stop();
      }
    },


    /**
     * Callback method for the "mouseDown" method.
     *
     * Sets the interval of the timer (value of firstInterval property) and
     * starts the timer. Additionally removes the state "abandoned" and adds the
     * state "pressed".
     *
     * @param e {qx.event.type.Mouse} mouseDown event
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

      this.__startInternalTimer();
      e.stopPropagation();
    },


    /**
     * Callback method for the "mouseUp" event.
     *
     * Handles the case that the user is releasing the mouse button
     * before the timer interval method got executed. This way the
     * "execute" method get executed at least one time.
     *
     * @param e {qx.event.type.Mouse} mouseUp event
     * @return {void}
     */
    _onMouseUp : function(e)
    {
      this.releaseCapture();

      if (!this.hasState("abandoned"))
      {
        this.addState("hovered");

        if (this.hasState("pressed") && !this.__executed) {
          this.execute();
        }
      }

      this.__stopInternalTimer();
      e.stopPropagation();
    },


    /**
     * Listener method for "keyup" event.
     *
     * Removes "abandoned" and "pressed" state (if "pressed" state is set)
     * for the keys "Enter" or "Space" and stopps the internal timer
     * (same like mouse up).
     *
     * @param e {Event} Key event
     * @return {void}
     */
    _onKeyUp : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          if (this.hasState("pressed"))
          {
            if (!this.__executed) {
              this.execute();
            }

            this.removeState("pressed");
            this.removeState("abandoned");
            e.stopPropagation();
            this.__stopInternalTimer();
          }
      }
    },


    /**
     * Listener method for "keydown" event.
     *
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space". It also starts
     * the internal timer (same like mousedown).
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
          this.__startInternalTimer();
      }
    },


    /**
     * Callback for the interval event.
     *
     * Stops the timer and starts it with a new interval
     * (value of the "interval" property - value of the "timerDecrease" property).
     * Dispatches the "execute" event.
     *
     * @param e {qx.event.type.Event} interval event
     * @return {void}
     */
    _onInterval : function(e)
    {
      this.__executed = true;
      this.fireEvent("execute");
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL TIMER
    ---------------------------------------------------------------------------
    */

    /**
     * Starts the internal timer which causes firing of execution
     * events in an interval. It also presses the button.
     *
     * @return {void}
     */
    __startInternalTimer : function()
    {
      this.fireEvent("press");

      this.__executed = false;

      this.__timer.set({
        interval: this.getInterval(),
        firstInterval: this.getFirstInterval(),
        minimum: this.getMinTimer(),
        decrease: this.getTimerDecrease()
      }).start();

      this.removeState("abandoned");
      this.addState("pressed");
    },


    /**
     * Stops the internal timer and releases the button.
     *
     * @return {void}
     */
    __stopInternalTimer : function()
    {
      this.fireEvent("release");

      this.__timer.stop();

      this.removeState("abandoned");
      this.removeState("pressed");
    }
  },




  /*
    *****************************************************************************
       DESTRUCTOR
    *****************************************************************************
    */

  destruct : function() {
    this._disposeObjects("__timer");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Timer, which accelerates after each interval. The initial delay and the
 * interval time can be set using the properties {@link #firstInterval}
 * and {@link #interval}. The {@link #interval} events will be fired with
 * decreasing interval times while the timer is running, until the {@link #minimum}
 * is reached. The {@link #decrease} property sets the amount of milliseconds
 * which will decreased after every firing.
 *
 * This class is e.g. used in the {@link qx.ui.form.RepeatButton} and
 * {@link qx.ui.form.HoverButton} widgets.
 */
qx.Class.define("qx.event.AcceleratingTimer",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.__timer = new qx.event.Timer(this.getInterval());
    this.__timer.addListener("interval", this._onInterval, this);
  },


  events :
  {
    /** This event if fired each time the interval time has elapsed */
    "interval" : "qx.event.type.Event"
  },


  properties :
  {
    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init  : 100
    },

    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init  : 500
    },

    /** This configures the minimum value for the timer interval. */
    minimum :
    {
      check : "Integer",
      init  : 20
    },

    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    decrease :
    {
      check : "Integer",
      init  : 2
    }
  },


  members :
  {
    __timer : null,
    __currentInterval : null,

    /**
     * Reset and start the timer.
     */
    start : function()
    {
      this.__timer.setInterval(this.getFirstInterval());
      this.__timer.start();
    },


    /**
     * Stop the timer
     */
    stop : function()
    {
      this.__timer.stop();
      this.__currentInterval = null;
    },


    /**
     * Interval event handler
     */
    _onInterval : function()
    {
      this.__timer.stop();

      if (this.__currentInterval == null) {
        this.__currentInterval = this.getInterval();
      }

      this.__currentInterval = Math.max(
        this.getMinimum(),
        this.__currentInterval - this.getDecrease()
      );

      this.__timer.setInterval(this.__currentInterval);
      this.__timer.start();

      this.fireEvent("interval");
    }
  },


  destruct : function() {
    this._disposeObjects("__timer");
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
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The ScrollArea provides a container widget with on demand scroll bars
 * if the content size exceeds the size of the container.
 *
 * @childControl pane {qx.ui.core.scroll.ScrollPane} pane which holds the content to scroll
 * @childControl scrollbar-x {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar} horizontal scrollbar
 * @childControl scrollbar-y {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar} vertical scrollbar
 * @childControl corner {qx.ui.core.Widget} corner where no scrollbar is shown
 */
qx.Class.define("qx.ui.core.scroll.AbstractScrollArea",
{
  extend : qx.ui.core.Widget,
  include : [
    qx.ui.core.scroll.MScrollBarFactory,
    qx.ui.core.scroll.MWheelHandling
  ],
  type : "abstract",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    if (qx.core.Environment.get("os.scrollBarOverlayed")) {
      // use a plain canvas to overlay the scroll bars
      this._setLayout(new qx.ui.layout.Canvas());
    } else {
      // Create 'fixed' grid layout
      var grid = new qx.ui.layout.Grid();
      grid.setColumnFlex(0, 1);
      grid.setRowFlex(0, 1);
      this._setLayout(grid);
    }

    // Mousewheel listener to scroll vertically
    this.addListener("mousewheel", this._onMouseWheel, this);

    // touch support
    if (qx.core.Environment.get("event.touch")) {
      // touch move listener for touch scrolling
      this.addListener("touchmove", this._onTouchMove, this);

      // reset the delta on every touch session
      this.addListener("touchstart", function() {
        this.__old = {"x": 0, "y": 0};
      }, this);

      this.__old = {};
      this.__impulseTimerId = {};
    }
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
      init : "scrollarea"
    },


    // overridden
    width :
    {
      refine : true,
      init : 100
    },


    // overridden
    height :
    {
      refine : true,
      init : 200
    },


    /**
     * The policy, when the horizontal scrollbar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scrollbar on demand</li>
     *   <li><b>on</b>: Always show the scrollbar</li>
     *   <li><b>off</b>: Never show the scrollbar</li>
     * </ul>
     */
    scrollbarX :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      themeable : true,
      apply : "_computeScrollbars"
    },


    /**
     * The policy, when the horizontal scrollbar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scrollbar on demand</li>
     *   <li><b>on</b>: Always show the scrollbar</li>
     *   <li><b>off</b>: Never show the scrollbar</li>
     * </ul>
     */
    scrollbarY :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      themeable : true,
      apply : "_computeScrollbars"
    },


    /**
     * Group property, to set the overflow of both scroll bars.
     */
    scrollbar : {
      group : [ "scrollbarX", "scrollbarY" ]
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __old : null,
    __impulseTimerId : null,


    /*
    ---------------------------------------------------------------------------
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "pane":
          control = new qx.ui.core.scroll.ScrollPane();

          control.addListener("update", this._computeScrollbars, this);
          control.addListener("scrollX", this._onScrollPaneX, this);
          control.addListener("scrollY", this._onScrollPaneY, this);

          if (qx.core.Environment.get("os.scrollBarOverlayed")) {
            this._add(control, {edge: 0});
          } else {
            this._add(control, {row: 0, column: 0});
          }
          break;


        case "scrollbar-x":
          control = this._createScrollBar("horizontal");
          control.setMinWidth(0);

          control.exclude();
          control.addListener("scroll", this._onScrollBarX, this);
          control.addListener("changeVisibility", this._onChangeScrollbarXVisibility, this);

          if (qx.core.Environment.get("os.scrollBarOverlayed")) {
            control.setMinHeight(qx.bom.element.Overflow.DEFAULT_SCROLLBAR_WIDTH);
            this._add(control, {bottom: 0, right: 0, left: 0});
          } else {
            this._add(control, {row: 1, column: 0});
          }
          break;


        case "scrollbar-y":
          control = this._createScrollBar("vertical");
          control.setMinHeight(0);

          control.exclude();
          control.addListener("scroll", this._onScrollBarY, this);
          control.addListener("changeVisibility", this._onChangeScrollbarYVisibility, this);


          if (qx.core.Environment.get("os.scrollBarOverlayed")) {
            control.setMinWidth(qx.bom.element.Overflow.DEFAULT_SCROLLBAR_WIDTH);
            this._add(control, {right: 0, bottom: 0, top: 0});
          } else {
            this._add(control, {row: 0, column: 1});
          }
          break;


        case "corner":
          control = new qx.ui.core.Widget();
          control.setWidth(0);
          control.setHeight(0);
          control.exclude();

          if (!qx.core.Environment.get("os.scrollBarOverlayed")) {
            // only add for non overlayed scroll bars
            this._add(control, {row: 1, column: 1});
          }
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      PANE SIZE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the boundaries of the pane.
     *
     * @return {Map} The pane boundaries.
     */
    getPaneSize : function() {
      return this.getChildControl("pane").getInnerSize();
    },






    /*
    ---------------------------------------------------------------------------
      ITEM LOCATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the top offset of the given item in relation to the
     * inner height of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemTop : function(item) {
      return this.getChildControl("pane").getItemTop(item);
    },


    /**
     * Returns the top offset of the end of the given item in relation to the
     * inner height of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemBottom : function(item) {
      return this.getChildControl("pane").getItemBottom(item);
    },


    /**
     * Returns the left offset of the given item in relation to the
     * inner width of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemLeft : function(item) {
      return this.getChildControl("pane").getItemLeft(item);
    },


    /**
     * Returns the left offset of the end of the given item in relation to the
     * inner width of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Right offset
     */
    getItemRight : function(item) {
      return this.getChildControl("pane").getItemRight(item);
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the element's content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     */
    scrollToX : function(value) {
      // First flush queue before scroll
      qx.ui.core.queue.Manager.flush();

      this.getChildControl("scrollbar-x").scrollTo(value);
    },


    /**
     * Scrolls the element's content by the given left offset
     *
     * @param value {Integer} The vertical position to scroll to.
     */
    scrollByX : function(value) {
      // First flush queue before scroll
      qx.ui.core.queue.Manager.flush();

      this.getChildControl("scrollbar-x").scrollBy(value);
    },


    /**
     * Returns the scroll left position of the content
     *
     * @return {Integer} Horizontal scroll position
     */
    getScrollX : function()
    {
      var scrollbar = this.getChildControl("scrollbar-x", true);
      return scrollbar ? scrollbar.getPosition() : 0;
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     */
    scrollToY : function(value) {
      // First flush queue before scroll
      qx.ui.core.queue.Manager.flush();

      this.getChildControl("scrollbar-y").scrollTo(value);
    },


    /**
     * Scrolls the element's content by the given top offset
     *
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollByY : function(value) {
      // First flush queue before scroll
      qx.ui.core.queue.Manager.flush();

      this.getChildControl("scrollbar-y").scrollBy(value);
    },


    /**
     * Returns the scroll top position of the content
     *
     * @return {Integer} Vertical scroll position
     */
    getScrollY : function()
    {
      var scrollbar = this.getChildControl("scrollbar-y", true);
      return scrollbar ? scrollbar.getPosition() : 0;
    },





    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the scroll event of the horizontal scrollbar
     *
     * @param e {qx.event.type.Data} The scroll event object
     * @return {void}
     */
    _onScrollBarX : function(e) {
      this.getChildControl("pane").scrollToX(e.getData());
    },


    /**
     * Event handler for the scroll event of the vertical scrollbar
     *
     * @param e {qx.event.type.Data} The scroll event object
     * @return {void}
     */
    _onScrollBarY : function(e) {
      this.getChildControl("pane").scrollToY(e.getData());
    },


    /**
     * Event handler for the horizontal scroll event of the pane
     *
     * @param e {qx.event.type.Data} The scroll event object
     * @return {void}
     */
    _onScrollPaneX : function(e) {
      this.scrollToX(e.getData());
    },


    /**
     * Event handler for the vertical scroll event of the pane
     *
     * @param e {qx.event.type.Data} The scroll event object
     * @return {void}
     */
    _onScrollPaneY : function(e) {
      this.scrollToY(e.getData());
    },


    /**
     * Event handler for the touch move.
     *
     * @param e {qx.event.type.Touch} The touch event
     */
    _onTouchMove : function(e)
    {
      this._onTouchMoveDirectional("x", e);
      this._onTouchMoveDirectional("y", e);

      // Stop bubbling and native event
      e.stop();
    },


    /**
     * Touch move handler for one direction.
     *
     * @param dir {String} Either 'x' or 'y'
     * @param e {qx.event.type.Touch} The touch event
     */
    _onTouchMoveDirectional : function(dir, e)
    {
      var docDir = (dir == "x" ? "Left" : "Top");

      // current scrollbar
      var scrollbar = this.getChildControl("scrollbar-" + dir, true);
      var show = this._isChildControlVisible("scrollbar-" + dir);

      if (show && scrollbar) {
        // get the delta for the current direction
        if(this.__old[dir] == 0) {
          var delta = 0;
        } else {
          var delta = -(e["getDocument" + docDir]() - this.__old[dir]);
        };
        // save the old value for the current direction
        this.__old[dir] = e["getDocument" + docDir]();

        scrollbar.scrollBy(delta);

        // if we have an old timeout for the current direction, clear it
        if (this.__impulseTimerId[dir]) {
          clearTimeout(this.__impulseTimerId[dir]);
          this.__impulseTimerId[dir] = null;
        }

        // set up a new timer for the current direction
        this.__impulseTimerId[dir] =
          setTimeout(qx.lang.Function.bind(function(delta) {
            this.__handleScrollImpulse(delta, dir);
          }, this, delta), 100);
      }
    },


    /**
     * Helper for momentum scrolling.
     * @param delta {Number} The delta from the last scrolling.
     * @param dir {String} Direction of the scrollbar ('x' or 'y').
     */
    __handleScrollImpulse : function(delta, dir) {
      // delete the old timer id
      this.__impulseTimerId[dir] = null;

      // do nothing if the scrollbar is not visible or we don't need to scroll
      var show = this._isChildControlVisible("scrollbar-" + dir);
      if (delta == 0 || !show) {
        return;
      }

      // linear momentum calculation
      if (delta > 0) {
        delta = Math.max(0, delta - 3);
      } else {
        delta = Math.min(0, delta + 3);
      }

      // set up a new timer with the new delta
      this.__impulseTimerId[dir] =
        setTimeout(qx.lang.Function.bind(function(delta, dir) {
          this.__handleScrollImpulse(delta, dir);
        }, this, delta, dir), 20);

      // scroll the desired new delta
      var scrollbar = this.getChildControl("scrollbar-" + dir, true);
      scrollbar.scrollBy(delta);
    },


    /**
     * Event handler for visibility changes of horizontal scrollbar.
     *
     * @param e {qx.event.type.Event} Property change event
     * @return {void}
     */
    _onChangeScrollbarXVisibility : function(e)
    {
      var showX = this._isChildControlVisible("scrollbar-x");
      var showY = this._isChildControlVisible("scrollbar-y");

      if (!showX) {
        this.scrollToX(0);
      }

      showX && showY ? this._showChildControl("corner") : this._excludeChildControl("corner");
    },


    /**
     * Event handler for visibility changes of horizontal scrollbar.
     *
     * @param e {qx.event.type.Event} Property change event
     * @return {void}
     */
    _onChangeScrollbarYVisibility : function(e)
    {
      var showX = this._isChildControlVisible("scrollbar-x");
      var showY = this._isChildControlVisible("scrollbar-y");

      if (!showY) {
        this.scrollToY(0);
      }

      showX && showY ? this._showChildControl("corner") : this._excludeChildControl("corner");
    },




    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the visibility state for scrollbars.
     *
     * @return {void}
     */
    _computeScrollbars : function()
    {
      var pane = this.getChildControl("pane");
      var content = pane.getChildren()[0];
      if (!content)
      {
        this._excludeChildControl("scrollbar-x");
        this._excludeChildControl("scrollbar-y");
        return;
      }

      var innerSize = this.getInnerSize();
      var paneSize = pane.getInnerSize();
      var scrollSize = pane.getScrollSize();

      // if the widget has not yet been rendered, return and try again in the
      // resize event
      if (!paneSize || !scrollSize) {
        return;
      }

      var scrollbarX = this.getScrollbarX();
      var scrollbarY = this.getScrollbarY();

      if (scrollbarX === "auto" && scrollbarY === "auto")
      {
        // Check if the container is big enough to show
        // the full content.
        var showX = scrollSize.width > innerSize.width;
        var showY = scrollSize.height > innerSize.height;

        // Dependency check
        // We need a special intelligence here when only one
        // of the autosized axis requires a scrollbar
        // This scrollbar may then influence the need
        // for the other one as well.
        if ((showX || showY) && !(showX && showY))
        {
          if (showX) {
            showY = scrollSize.height > paneSize.height;
          } else if (showY) {
            showX = scrollSize.width > paneSize.width;
          }
        }
      }
      else
      {
        var showX = scrollbarX === "on";
        var showY = scrollbarY === "on";

        // Check auto values afterwards with already
        // corrected client dimensions
        if (scrollSize.width > (showX ? paneSize.width : innerSize.width) && scrollbarX === "auto") {
          showX = true;
        }

        if (scrollSize.height > (showX ? paneSize.height : innerSize.height) && scrollbarY === "auto") {
          showY = true;
        }
      }

      // Update scrollbars
      if (showX)
      {
        var barX = this.getChildControl("scrollbar-x");

        barX.show();
        barX.setMaximum(Math.max(0, scrollSize.width - paneSize.width));
        barX.setKnobFactor((scrollSize.width === 0) ? 0 : paneSize.width / scrollSize.width);
      }
      else
      {
        this._excludeChildControl("scrollbar-x");
      }

      if (showY)
      {
        var barY = this.getChildControl("scrollbar-y");

        barY.show();
        barY.setMaximum(Math.max(0, scrollSize.height - paneSize.height));
        barY.setKnobFactor((scrollSize.height === 0) ? 0 : paneSize.height / scrollSize.height);
      }
      else
      {
        this._excludeChildControl("scrollbar-y");
      }
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This class is responsible for checking the scrolling behavior of the client.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Scroll",
{
  statics :
  {
    /**
     * Check if the scrollbars should be positioned on top of the content. This
     * is true of OSX Lion when the scrollbars dissapear automatically.
     *
     * @internal
     *
     * @return {Boolean} <code>true</code> if the scrollbars should be
     *   positioned on top of the content.
     */
    scrollBarOverlayed : function() {
      var scrollBarWidth = qx.bom.element.Overflow.getScrollbarWidth();
      var osx = qx.bom.client.OperatingSystem.getName() === "osx";
      var nativeScrollBars = qx.core.Environment.get("qx.nativeScrollBars");

      return scrollBarWidth == 0 && osx && nativeScrollBars;
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("os.scrollBarOverlayed", statics.scrollBarOverlayed);
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
 * This class represents a scroll able pane. This means that this widget
 * may contain content which is bigger than the available (inner)
 * dimensions of this widget. The widget also offer methods to control
 * the scrolling position. It can only have exactly one child.
 */
qx.Class.define("qx.ui.core.scroll.ScrollPane",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.set({
      minWidth: 0,
      minHeight: 0
    });

    // Automatically configure a "fixed" grow layout.
    this._setLayout(new qx.ui.layout.Grow());

    // Add resize listener to "translate" event
    this.addListener("resize", this._onUpdate);

    var contentEl = this.getContentElement();

    // Synchronizes the DOM scroll position with the properties
    contentEl.addListener("scroll", this._onScroll, this);

    // Fixed some browser quirks e.g. correcting scroll position
    // to the previous value on re-display of a pane
    contentEl.addListener("appear", this._onAppear, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired on resize of both the container or the content. */
    update : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The horizontal scroll position */
    scrollX :
    {
      check : "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getScrollMaxX()",
      apply : "_applyScrollX",
      event : "scrollX",
      init  : 0
    },

    /** The vertical scroll position */
    scrollY :
    {
      check : "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getScrollMaxY()",
      apply : "_applyScrollY",
      event : "scrollY",
      init  : 0
    }
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
      CONTENT MANAGEMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Configures the content of the scroll pane. Replaces any existing child
     * with the newly given one.
     *
     * @param widget {qx.ui.core.Widget?null} The content widget of the pane
     * @return {void}
     */
    add : function(widget)
    {
      var old = this._getChildren()[0];
      if (old)
      {
        this._remove(old);
        old.removeListener("resize", this._onUpdate, this);
      }

      if (widget)
      {
        this._add(widget);
        widget.addListener("resize", this._onUpdate, this);
      }
    },


    /**
     * Removes the given widget from the content. The pane is empty
     * afterwards as only one child is supported by the pane.
     *
     * @param widget {qx.ui.core.Widget?null} The content widget of the pane
     * @return {void}
     */
    remove : function(widget)
    {
      if (widget)
      {
        this._remove(widget);
        widget.removeListener("resize", this._onUpdate, this);
      }
    },


    /**
     * Returns an array containing the current content.
     *
     * @return {Object[]} The content array
     */
    getChildren : function() {
      return this._getChildren();
    },



    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for resize event of content and container
     *
     * @param e {Event} Resize event object
     */
    _onUpdate : function(e) {
      this.fireEvent("update");
    },


    /**
     * Event listener for scroll event of content
     *
     * @param e {qx.event.type.Event} Scroll event object
     */
    _onScroll : function(e)
    {
      var contentEl = this.getContentElement();

      this.setScrollX(contentEl.getScrollX());
      this.setScrollY(contentEl.getScrollY());
    },


    /**
     * Event listener for appear event of content
     *
     * @param e {qx.event.type.Event} Appear event object
     */
    _onAppear : function(e)
    {
      var contentEl = this.getContentElement();

      var internalX = this.getScrollX();
      var domX = contentEl.getScrollX();

      if (internalX != domX) {
        contentEl.scrollToX(internalX);
      }

      var internalY = this.getScrollY();
      var domY = contentEl.getScrollY();

      if (internalY != domY) {
        contentEl.scrollToY(internalY);
      }
    },





    /*
    ---------------------------------------------------------------------------
      ITEM LOCATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the top offset of the given item in relation to the
     * inner height of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemTop : function(item)
    {
      var top = 0;

      do
      {
        top += item.getBounds().top;
        item = item.getLayoutParent();
      }
      while (item && item !== this);

      return top;
    },


    /**
     * Returns the top offset of the end of the given item in relation to the
     * inner height of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemBottom : function(item) {
      return this.getItemTop(item) + item.getBounds().height;
    },


    /**
     * Returns the left offset of the given item in relation to the
     * inner width of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemLeft : function(item)
    {
      var left = 0;
      var parent;

      do
      {
        left += item.getBounds().left;
        parent = item.getLayoutParent();
        if (parent) {
          left += parent.getInsets().left;
        }
        item = parent;
      }
      while (item && item !== this);

      return left;
    },


    /**
     * Returns the left offset of the end of the given item in relation to the
     * inner width of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Right offset
     */
    getItemRight : function(item) {
      return this.getItemLeft(item) + item.getBounds().width;
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * The size (identical with the preferred size) of the content.
     *
     * @return {Map} Size of the content (keys: <code>width</code> and <code>height</code>)
     */
    getScrollSize : function() {
      return this.getChildren()[0].getBounds();
    },






    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * The maximum horizontal scroll position.
     *
     * @return {Integer} Maximum horizontal scroll position.
     */
    getScrollMaxX : function()
    {
      var paneSize = this.getInnerSize();
      var scrollSize = this.getScrollSize();

      if (paneSize && scrollSize) {
        return Math.max(0, scrollSize.width - paneSize.width);
      }

      return 0;
    },


    /**
     * The maximum vertical scroll position.
     *
     * @return {Integer} Maximum vertical scroll position.
     */
    getScrollMaxY : function()
    {
      var paneSize = this.getInnerSize();
      var scrollSize = this.getScrollSize();

      if (paneSize && scrollSize) {
        return Math.max(0, scrollSize.height - paneSize.height);
      }

      return 0;
    },


    /**
     * Scrolls the element's content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     * @return {void}
     */
    scrollToX : function(value)
    {
      var max = this.getScrollMaxX();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }

      this.setScrollX(value);
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollToY : function(value)
    {
      var max = this.getScrollMaxY();

      if (value < 0) {
        value = 0;
      } else if (value > max) {
        value = max;
      }

      this.setScrollY(value);
    },


    /**
     * Scrolls the element's content horizontally by the given amount.
     *
     * @param x {Integer?0} Amount to scroll
     * @return {void}
     */
    scrollByX : function(x) {
      this.scrollToX(this.getScrollX() + x);
    },


    /**
     * Scrolls the element's content vertically by the given amount.
     *
     * @param y {Integer?0} Amount to scroll
     * @return {void}
     */
    scrollByY : function(y) {
      this.scrollToY(this.getScrollY() + y);
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyScrollX : function(value) {
      this.getContentElement().scrollToX(value);
    },


    // property apply
    _applyScrollY : function(value) {
      this.getContentElement().scrollToY(value);
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
 * This interface should be used in all objects managing a set of items
 * implementing {@link qx.ui.form.IModel}.
 */
qx.Interface.define("qx.ui.form.IModelSelection",
{

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Tries to set the selection using the given array containing the
     * representative models for the selectables.
     *
     * @param value {Array} An array of models.
     */
    setModelSelection : function(value) {},


    /**
     * Returns an array of the selected models.
     *
     * @return {Array} An array containing the models of the currently selected
     *   items.
     */
    getModelSelection : function() {}
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
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * A list of items. Displays an automatically scrolling list for all
 * added {@link qx.ui.form.ListItem} instances. Supports various
 * selection options: single, multi, ...
 */
qx.Class.define("qx.ui.form.List",
{
  extend : qx.ui.core.scroll.AbstractScrollArea,
  implement : [
    qx.ui.core.IMultiSelection,
    qx.ui.form.IForm,
    qx.ui.form.IModelSelection
  ],
  include : [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MMultiSelectionHandling,
    qx.ui.form.MForm,
    qx.ui.form.MModelSelection
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param horizontal {Boolean?false} Whether the list should be horizontal.
   */
  construct : function(horizontal)
  {
    this.base(arguments);

    // Create content
    this.__content = this._createListItemContainer();

    // Used to fire item add/remove events
    this.__content.addListener("addChildWidget", this._onAddChild, this);
    this.__content.addListener("removeChildWidget", this._onRemoveChild, this);

    // Add to scrollpane
    this.getChildControl("pane").add(this.__content);

    // Apply orientation
    if (horizontal) {
      this.setOrientation("horizontal");
    } else {
      this.initOrientation();
    }

    // Add keypress listener
    this.addListener("keypress", this._onKeyPress);
    this.addListener("keyinput", this._onKeyInput);

    // initialize the search string
    this.__pressedString = "";
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */


  events :
  {
    /**
     * This event is fired after a list item was added to the list. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added item.
     */
    addItem : "qx.event.type.Data",

    /**
     * This event is fired after a list item has been removed from the list.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed item.
     */
    removeItem : "qx.event.type.Data"
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
      init : "list"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    /**
     * Whether the list should be rendered horizontal or vertical.
     */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyOrientation"
    },

    /** Spacing between the items */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applySpacing",
      themeable : true
    },

    /** Controls whether the inline-find feature is activated or not */
    enableInlineFind :
    {
      check : "Boolean",
      init : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    __pressedString : null,
    __lastKeyPress : null,

    /** {qx.ui.core.Widget} The children container */
    __content : null,

    /** {Class} Pointer to the selection manager to use */
    SELECTION_MANAGER : qx.ui.core.selection.ScrollArea,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */


    // overridden
    getChildrenContainer : function() {
      return this.__content;
    },

    /**
     * Handle child widget adds on the content pane
     *
     * @param e {qx.event.type.Data} the event instance
     */
    _onAddChild : function(e) {
      this.fireDataEvent("addItem", e.getData());
    },

    /**
     * Handle child widget removes on the content pane
     *
     * @param e {qx.event.type.Data} the event instance
     */
    _onRemoveChild : function(e) {
      this.fireDataEvent("removeItem", e.getData());
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Used to route external <code>keypress</code> events to the list
     * handling (in fact the manager of the list)
     *
     * @param e {qx.event.type.KeySequence} KeyPress event
     */
    handleKeyPress : function(e)
    {
      if (!this._onKeyPress(e)) {
        this._getManager().handleKeyPress(e);
      }
    },



    /*
    ---------------------------------------------------------------------------
      PROTECTED API
    ---------------------------------------------------------------------------
    */

    /**
     * This container holds the list item widgets.
     *
     * @return {qx.ui.container.Composite} Container for the list item widgets
     */
    _createListItemContainer : function() {
      return new qx.ui.container.Composite;
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyOrientation : function(value, old)
    {
      // Create new layout
      var horizontal = value === "horizontal";
      var layout = horizontal ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();

      // Configure content
      var content = this.__content;
      content.setLayout(layout);
      content.setAllowGrowX(!horizontal);
      content.setAllowGrowY(horizontal);

      // Configure spacing
      this._applySpacing(this.getSpacing());
    },

    // property apply
    _applySpacing : function(value, old) {
      this.__content.getLayout().setSpacing(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for <code>keypress</code> events.
     *
     * @param e {qx.event.type.KeySequence} KeyPress event
     * @return {Boolean} Whether the event was processed
     */
    _onKeyPress : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelection();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }

        return true;
      }

      return false;
    },


    /*
    ---------------------------------------------------------------------------
      FIND SUPPORT
    ---------------------------------------------------------------------------
    */


    /**
     * Handles the inline find - if enabled
     *
     * @param e {qx.event.type.KeyInput} key input event
     */
    _onKeyInput : function(e)
    {
      // do nothing if the find is disabled
      if (!this.getEnableInlineFind()) {
        return;
      }

      // Only useful in single or one selection mode
      var mode = this.getSelectionMode();
      if (!(mode === "single" || mode === "one")) {
        return;
      }

      // Reset string after a second of non pressed key
      if (((new Date).valueOf() - this.__lastKeyPress) > 1000) {
        this.__pressedString = "";
      }

      // Combine keys the user pressed to a string
      this.__pressedString += e.getChar();

      // Find matching item
      var matchedItem = this.findItemByLabelFuzzy(this.__pressedString);

      // if an item was found, select it
      if (matchedItem) {
        this.setSelection([matchedItem]);
      }

      // Store timestamp
      this.__lastKeyPress = (new Date).valueOf();
    },

    /**
     * Takes the given string and tries to find a ListItem
     * which starts with this string. The search is not case sensitive and the
     * first found ListItem will be returned. If there could not be found any
     * qualifying list item, null will be returned.
     *
     * @param search {String} The text with which the label of the ListItem should start with
     * @return {qx.ui.form.ListItem} The found ListItem or null
     */
    findItemByLabelFuzzy : function(search)
    {
      // lower case search text
      search = search.toLowerCase();

      // get all items of the list
      var items = this.getChildren();

      // go threw all items
      for (var i=0, l=items.length; i<l; i++)
      {
        // get the label of the current item
        var currentLabel = items[i].getLabel();

        // if the label fits with the search text (ignore case, begins with)
        if (currentLabel && currentLabel.toLowerCase().indexOf(search) == 0)
        {
          // just return the first found element
          return items[i];
        }
      }

      // if no element was found, return null
      return null;
    },

    /**
     * Find an item by its {@link qx.ui.basic.Atom#getLabel}.
     *
     * @param search {String} A label or any item
     * @param ignoreCase {Boolean?true} description
     * @return {qx.ui.form.ListItem} The found ListItem or null
     */
    findItem : function(search, ignoreCase)
    {
      // lowercase search
      if (ignoreCase !== false) {
        search = search.toLowerCase();
      };

      // get all items of the list
      var items = this.getChildren();
      var item;

      // go through all items
      for (var i=0, l=items.length; i<l; i++)
      {
        item = items[i];

        // get the content of the label; text content when rich
        var label;

        if (item.isRich()) {
          var control = item.getChildControl("label", true);
          if (control) {
            var labelNode = control.getContentElement().getDomElement();
            if (labelNode) {
              label = qx.bom.element.Attribute.get(labelNode, "text");
            }
          }

        } else {
          label = item.getLabel();
        }

        if (label != null) {
          if (label.translate) {
            label = label.translate();
          }
          if (ignoreCase !== false) {
            label = label.toLowerCase();
          }

          if (label.toString() == search.toString()) {
            return item;
          }
        }
      }

      return null;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__content");
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

************************************************************************ */

/**
 * The data model of a table.
 */
qx.Interface.define("qx.ui.table.ITableModel",
{
  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     * Fired when the table data changed (the stuff shown in the table body).
     * The data property of the event may be null or a map having the following attributes:
     * <ul>
     *   <li>firstRow: The index of the first row that has changed.</li>
     *   <li>lastRow: The index of the last row that has changed.</li>
     *   <li>firstColumn: The model index of the first column that has changed.</li>
     *   <li>lastColumn: The model index of the last column that has changed.</li>
     * </ul>
     */
    "dataChanged" : "qx.event.type.Data",

    /**
     * Fired when the meta data changed (the stuff shown in the table header).
     */
    "metaDataChanged" : "qx.event.type.Event",

    /**
     * Fired after the table is sorted (but before the metaDataChanged event)
     */
    "sorted" : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the number of rows in the model.
     *
     * @abstract
     * @return {Integer} the number of rows.
     */
    getRowCount : function() {},


    /**
     *
     * Returns the data of one row. This function may be overridden by models which hold
     * all data of a row in one object. By using this function, clients have a way of
     * quickly retrieving the entire row data.
     *
     * <b>Important:</b>Models which do not have their row data accessible in one object
     * may return null.
     *
     * @param rowIndex {Integer} the model index of the row.
     * @return {Object} the row data as an object or null if the model does not support row data
     *                    objects. The details on the object returned are determined by the model
     *                    implementation only.
     */
    getRowData : function(rowIndex) {},


    /**
     * Returns the number of columns in the model.
     *
     * @abstract
     * @return {Integer} the number of columns.
     */
    getColumnCount : function() {},


    /**
     * Returns the ID of column. The ID may be used to identify columns
     * independent from their index in the model. E.g. for being aware of added
     * columns when saving the width of a column.
     *
     * @abstract
     * @param columnIndex {Integer} the index of the column.
     * @return {String} the ID of the column.
     */
    getColumnId : function(columnIndex) {},


    /**
     * Returns the index of a column.
     *
     * @abstract
     * @param columnId {String} the ID of the column.
     * @return {Integer} the index of the column.
     */
    getColumnIndexById : function(columnId) {},


    /**
     * Returns the name of a column. This name will be shown to the user in the
     * table header.
     *
     * @abstract
     * @param columnIndex {Integer} the index of the column.
     * @return {String} the name of the column.
     */
    getColumnName : function(columnIndex) {},


    /**
     * Returns whether a column is editable.
     *
     * @param columnIndex {Integer} the column to check.
     * @return {Boolean} whether the column is editable.
     */
    isColumnEditable : function(columnIndex) {},


    /**
     * Returns whether a column is sortable.
     *
     * @param columnIndex {Integer} the column to check.
     * @return {Boolean} whether the column is sortable.
     */
    isColumnSortable : function(columnIndex) {},


    /**
     * Sorts the model by a column.
     *
     * @param columnIndex {Integer} the column to sort by.
     * @param ascending {Boolean} whether to sort ascending.
     * @return {void}
     */
    sortByColumn : function(columnIndex, ascending) {},


    /**
     * Returns the column index the model is sorted by. If the model is not sorted
     * -1 is returned.
     *
     * @return {Integer} the column index the model is sorted by.
     */
    getSortColumnIndex : function() {},


    /**
     * Returns whether the model is sorted ascending.
     *
     * @return {Boolean} whether the model is sorted ascending.
     */
    isSortAscending : function() {},


    /**
     * Prefetches some rows. This is a hint to the model that the specified rows
     * will be read soon.
     *
     * @param firstRowIndex {Integer} the index of first row.
     * @param lastRowIndex {Integer} the index of last row.
     * @return {void}
     */
    prefetchRows : function(firstRowIndex, lastRowIndex) {},


    /**
     * Returns a cell value by column index.
     *
     * @abstract
     * @param columnIndex {Integer} the index of the column.
     * @param rowIndex {Integer} the index of the row.
     * @return {var} The value of the cell.
     * @see #getValueById
     */
    getValue : function(columnIndex, rowIndex) {},


    /**
     * Returns a cell value by column ID.
     *
     * Whenever you have the choice, use {@link #getValue()} instead,
     * because this should be faster.
     *
     * @param columnId {String} the ID of the column.
     * @param rowIndex {Integer} the index of the row.
     * @return {var} the value of the cell.
     */
    getValueById : function(columnId, rowIndex) {},


    /**
     * Sets a cell value by column index.
     *
     * @abstract
     * @param columnIndex {Integer} The index of the column.
     * @param rowIndex {Integer} the index of the row.
     * @param value {var} The new value.
     * @return {void}
     * @see #setValueById
     */
    setValue : function(columnIndex, rowIndex, value) {},


    /**
     * Sets a cell value by column ID.
     *
     * Whenever you have the choice, use {@link #setValue()} instead,
     * because this should be faster.
     *
     * @param columnId {String} The ID of the column.
     * @param rowIndex {Integer} The index of the row.
     * @param value {var} The new value.
     */
    setValueById : function(columnId, rowIndex, value) {}
  }
});/* ************************************************************************

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

************************************************************************ */

/**
 * An abstract table model that performs the column handling, so subclasses only
 * need to care for row handling.
 */
qx.Class.define("qx.ui.table.model.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,
  implement : qx.ui.table.ITableModel,


  events :
  {
    /**
     * Fired when the table data changed (the stuff shown in the table body).
     * The data property of the event will be a map having the following
     * attributes:
     * <ul>
     *   <li>firstRow: The index of the first row that has changed.</li>
     *   <li>lastRow: The index of the last row that has changed.</li>
     *   <li>firstColumn: The model index of the first column that has changed.</li>
     *   <li>lastColumn: The model index of the last column that has changed.</li>
     * </ul>
     *
     * Additionally, if the data changed as a result of rows being removed
     * from the data model, then these additional attributes will be in the
     * data:
     * <ul>
     *   <li>removeStart: The model index of the first row that was removed.</li>
     *   <li>removeCount: The number of rows that were removed.</li>
     * </ul>
     */
    "dataChanged" : "qx.event.type.Data",

    /**
     * Fired when the meta data changed (the stuff shown in the table header).
     */
    "metaDataChanged" : "qx.event.type.Event",

    /**
     * Fired after the table is sorted (but before the metaDataChanged event)
     */
    "sorted" : "qx.event.type.Data"
  },


  construct : function()
  {
    this.base(arguments);

    this.__columnIdArr = [];
    this.__columnNameArr = [];
    this.__columnIndexMap = {};
  },


  members :
  {
    __columnIdArr : null,
    __columnNameArr : null,
    __columnIndexMap : null,
    __internalChange : null,


    /**
     * Initialize the table model <--> table interaction. The table model is
     * passed to the table constructor, but the table model doesn't otherwise
     * know anything about the table nor can it operate on table
     * properties. This function provides the capability for the table model
     * to specify characteristics of the table. It is called when the table
     * model is applied to the table.
     *
     * @param table {qx.ui.table.Table}
     *   The table to which this model is attached
     */
    init : function(table) {
      // default implementation has nothing to do
    },

    /**
     * Abstract method
     * @throws {Error} An error if this method is called.
     */
    getRowCount : function() {
      throw new Error("getRowCount is abstract");
    },

    getRowData : function(rowIndex) {
      return null;
    },

    isColumnEditable : function(columnIndex) {
      return false;
    },

    isColumnSortable : function(columnIndex) {
      return false;
    },

    sortByColumn : function(columnIndex, ascending) {
    },

    getSortColumnIndex : function() {
      return -1;
    },

    isSortAscending : function() {
      return true;
    },

    prefetchRows : function(firstRowIndex, lastRowIndex) {
    },

    /**
     * Abstract method
     *
     * @param columnIndex {Integer} the index of the column
     * @param rowIndex {Integer} the index of the row
     *
     * @throws {Error} An error if this method is called.
     */
    getValue : function(columnIndex, rowIndex) {
      throw new Error("getValue is abstract");
    },

    getValueById : function(columnId, rowIndex) {
      return this.getValue(this.getColumnIndexById(columnId), rowIndex);
    },

    /**
     * Abstract method
     *
     * @param columnIndex {Integer} index of the column
     * @param rowIndex {Integer} index of the row
     * @param value {Var} Value to be set
     *
     * @throws {Error} An error if this method is called.
     */
    setValue : function(columnIndex, rowIndex, value) {
      throw new Error("setValue is abstract");
    },

    setValueById : function(columnId, rowIndex, value) {
      this.setValue(this.getColumnIndexById(columnId), rowIndex, value);
    },

    // overridden
    getColumnCount : function() {
      return this.__columnIdArr.length;
    },

    // overridden
    getColumnIndexById : function(columnId) {
      return this.__columnIndexMap[columnId];
    },

    // overridden
    getColumnId : function(columnIndex) {
      return this.__columnIdArr[columnIndex];
    },

    // overridden
    getColumnName : function(columnIndex) {
      return this.__columnNameArr[columnIndex];
    },


    /**
     * Sets the column IDs. These IDs may be used internally to identify a
     * column.
     *
     * Note: This will clear previously set column names.
     *
     *
     * @param columnIdArr {String[]} the IDs of the columns.
     * @return {void}
     * @see #setColumns
     */
    setColumnIds : function(columnIdArr)
    {
      this.__columnIdArr = columnIdArr;

      // Create the reverse map
      this.__columnIndexMap = {};

      for (var i=0; i<columnIdArr.length; i++) {
        this.__columnIndexMap[columnIdArr[i]] = i;
      }

      this.__columnNameArr = new Array(columnIdArr.length);

      // Inform the listeners
      if (!this.__internalChange) {
        this.fireEvent("metaDataChanged");
      }
    },


    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @param columnNameArr {String[]} the names of the columns.
     * @return {void}
     * @throws {Error} If the amount of given columns is different from the table.
     * @see #setColumnIds
     */
    setColumnNamesByIndex : function(columnNameArr)
    {
      if (this.__columnIdArr.length != columnNameArr.length) {
        throw new Error("this.__columnIdArr and columnNameArr have different length: " + this.__columnIdArr.length + " != " + columnNameArr.length);
      }

      this.__columnNameArr = columnNameArr;

      // Inform the listeners
      this.fireEvent("metaDataChanged");
    },


    /**
     * Sets the column names. These names will be shown to the user.
     *
     * Note: The column IDs have to be defined before.
     *
     *
     * @param columnNameMap {Map} a map containing the column IDs as keys and the
     *          column name as values.
     * @return {void}
     * @see #setColumnIds
     */
    setColumnNamesById : function(columnNameMap)
    {
      this.__columnNameArr = new Array(this.__columnIdArr.length);

      for (var i=0; i<this.__columnIdArr.length; ++i) {
        this.__columnNameArr[i] = columnNameMap[this.__columnIdArr[i]];
      }
    },


    /**
     * Sets the column names (and optionally IDs)
     *
     * Note: You can not change the _number_ of columns this way.  The number
     *       of columns is highly intertwined in the entire table operation,
     *       and dynamically changing it would require as much work as just
     *       recreating your table.  If you must change the number of columns
     *       in a table then you should remove the table and add a new one.
     *
     * @param columnNameArr {String[]}
     *   The column names. These names will be shown to the user.
     *
     * @param columnIdArr {String[] ? null}
     *   The column IDs. These IDs may be used internally to identify a
     *   column. If null, the column names are used as IDs unless ID values
     *   have already been set. If ID values have already been set, they will
     *   continue to be used if no ID values are explicitly provided here.
     *
     * @throws {Error} If the amount of given columns is different from the table.
     *
     * @return {void}
     */
    setColumns : function(columnNameArr, columnIdArr)
    {
      var bSetIds = this.__columnIdArr.length == 0 || columnIdArr;

      if (columnIdArr == null) {
        if (this.__columnIdArr.length == 0) {
          columnIdArr = columnNameArr;
        } else {
          columnIdArr = this.__columnIdArr;
        }
      }

      if (columnIdArr.length != columnNameArr.length) {
        throw new Error("columnIdArr and columnNameArr have different length: " + columnIdArr.length + " != " + columnNameArr.length);
      }

      if (bSetIds)
      {
        this.__internalChange = true;
        this.setColumnIds(columnIdArr);
        this.__internalChange = false;
      }

      this.setColumnNamesByIndex(columnNameArr);
    }
  },


  destruct : function() {
    this.__columnIdArr = this.__columnNameArr = this.__columnIndexMap = null;
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

************************************************************************ */

/**
 * A simple table model that provides an API for changing the model data.
 */
qx.Class.define("qx.ui.table.model.Simple",
{
  extend : qx.ui.table.model.Abstract,


  construct : function()
  {
    this.base(arguments);

    this.__rowArr = [];
    this.__sortColumnIndex = -1;

    // Array of objects, each with property "ascending" and "descending"
    this.__sortMethods = [];

    this.__editableColArr = null;
  },

  properties :
  {
    /**
     * Whether sorting should be case sensitive
     */
    caseSensitiveSorting :
    {
      check : "Boolean",
      init : true
    }
  },


  statics :
  {
    /**
     * Default ascendeing sort method to use if no custom method has been
     * provided.
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorAscending : function(row1, row2)
    {
      var obj1 = row1[arguments.callee.columnIndex];
      var obj2 = row2[arguments.callee.columnIndex];
      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    },


    /**
     * Same as the Default ascending sort method but using case insensitivity
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorInsensitiveAscending : function(row1, row2)
    {
      var obj1 = (row1[arguments.callee.columnIndex].toLowerCase ?
            row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);
      var obj2 = (row2[arguments.callee.columnIndex].toLowerCase ?
            row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);

      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 > obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    },


    /**
     * Default descending sort method to use if no custom method has been
     * provided.
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorDescending : function(row1, row2)
    {
      var obj1 = row1[arguments.callee.columnIndex];
      var obj2 = row2[arguments.callee.columnIndex];
      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    },


    /**
     * Same as the Default descending sort method but using case insensitivity
     *
     * @param row1 {var} first row
     * @param row2 {var} second row
     * @return {Integer} 1 of row1 is > row2, -1 if row1 is < row2, 0 if row1 == row2
     */
    _defaultSortComparatorInsensitiveDescending : function(row1, row2)
    {
      var obj1 = (row1[arguments.callee.columnIndex].toLowerCase ?
          row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);
      var obj2 = (row2[arguments.callee.columnIndex].toLowerCase ?
          row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);
      if (qx.lang.Type.isNumber(obj1) && qx.lang.Type.isNumber(obj2)) {
        var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
        if (result != null) {
          return result;
        }
      }
      return (obj1 < obj2) ? 1 : ((obj1 == obj2) ? 0 : -1);
    }

  },


  members :
  {
    __rowArr : null,
    __editableColArr : null,
    __sortableColArr : null,
    __sortMethods : null,
    __sortColumnIndex : null,
    __sortAscending : null,


    // overridden
    getRowData : function(rowIndex)
    {
      var rowData = this.__rowArr[rowIndex];
      if (rowData == null || rowData.originalData == null) {
        return rowData;
      } else {
        return rowData.originalData;
      }
    },


    /**
     * Returns the data of one row as map containing the column IDs as key and
     * the cell values as value. Also the meta data is included.
     *
     * @param rowIndex {Integer} the model index of the row.
     * @return {Map} a Map containing the column values.
     */
    getRowDataAsMap : function(rowIndex)
    {
      var rowData = this.__rowArr[rowIndex];

      if (rowData != null) {
        var map = {};
        // get the current set data
        for (var col = 0; col < this.getColumnCount(); col++) {
          map[this.getColumnId(col)] = rowData[col];
        }

        if (rowData.originalData != null) {
          // merge in the meta data
          for (var key in rowData.originalData) {
            if (map[key] == undefined) {
              map[key] = rowData.originalData[key];
            }
          }
        }

        return map;
      }
      // may be null, which is ok
      return (rowData && rowData.originalData) ? rowData.originalData : null;
    },


    /**
     * Gets the whole data as an array of maps.
     *
     * Note: Individual items are retrieved by {@link #getRowDataAsMap}.
     */
    getDataAsMapArray: function() {
      var len = this.getRowCount();
      var data = [];

      for (var i = 0; i < len; i++)
      {
        data.push(this.getRowDataAsMap(i));
      }

      return data;
    },


    /**
     * Sets all columns editable or not editable.
     *
     * @param editable {Boolean} whether all columns are editable.
     * @return {void}
     */
    setEditable : function(editable)
    {
      this.__editableColArr = [];

      for (var col=0; col<this.getColumnCount(); col++) {
        this.__editableColArr[col] = editable;
      }

      this.fireEvent("metaDataChanged");
    },


    /**
     * Sets whether a column is editable.
     *
     * @param columnIndex {Integer} the column of which to set the editable state.
     * @param editable {Boolean} whether the column should be editable.
     * @return {void}
     */
    setColumnEditable : function(columnIndex, editable)
    {
      if (editable != this.isColumnEditable(columnIndex))
      {
        if (this.__editableColArr == null) {
          this.__editableColArr = [];
        }

        this.__editableColArr[columnIndex] = editable;

        this.fireEvent("metaDataChanged");
      }
    },

    // overridden
    isColumnEditable : function(columnIndex) {
      return this.__editableColArr ? (this.__editableColArr[columnIndex] == true) : false;
    },


    /**
     * Sets whether a column is sortable.
     *
     * @param columnIndex {Integer} the column of which to set the sortable state.
     * @param sortable {Boolean} whether the column should be sortable.
     */
    setColumnSortable : function(columnIndex, sortable)
    {
      if (sortable != this.isColumnSortable(columnIndex))
      {
        if (this.__sortableColArr == null) {
          this.__sortableColArr = [];
        }

        this.__sortableColArr[columnIndex] = sortable;
        this.fireEvent("metaDataChanged");
      }
    },


    // overridden
    isColumnSortable : function(columnIndex) {
      return (
        this.__sortableColArr
        ? (this.__sortableColArr[columnIndex] !== false)
        : true
      );
    },

    // overridden
    sortByColumn : function(columnIndex, ascending)
    {
      // NOTE: We use different comparators for ascending and descending,
      //     because comparators should be really fast.
      var comparator;

      var sortMethods = this.__sortMethods[columnIndex];
      if (sortMethods)
      {
        comparator =
          (ascending
           ? sortMethods.ascending
           : sortMethods.descending);
      }
      else
      {
        if (this.getCaseSensitiveSorting())
        {
          comparator =
            (ascending
             ? qx.ui.table.model.Simple._defaultSortComparatorAscending
             : qx.ui.table.model.Simple._defaultSortComparatorDescending);
        }
        else
        {
          comparator =
            (ascending
             ? qx.ui.table.model.Simple._defaultSortComparatorInsensitiveAscending
             : qx.ui.table.model.Simple._defaultSortComparatorInsensitiveDescending);
        }
      }

      comparator.columnIndex = columnIndex;
      this.__rowArr.sort(comparator);

      this.__sortColumnIndex = columnIndex;
      this.__sortAscending = ascending;

      var data =
        {
          columnIndex : columnIndex,
          ascending   : ascending
        };
      this.fireDataEvent("sorted", data);

      this.fireEvent("metaDataChanged");
    },


    /**
     * Specify the methods to use for ascending and descending sorts of a
     * particular column.
     *
     * @param columnIndex {Integer}
     *   The index of the column for which the sort methods are being
     *   provided.
     *
     * @param compare {Function|Map}
     *   If provided as a Function, this is the comparator function to sort in
     *   ascending order. It takes two parameters: the two arrays of row data,
     *   row1 and row2, being compared. It may determine which column of the
     *   row data to sort on by accessing arguments.callee.columnIndex.  The
     *   comparator function must return 1, 0 or -1, when the column in row1
     *   is greater than, equal to, or less than, respectively, the column in
     *   row2.
     *
     *   If this parameter is a Map, it shall have two properties: "ascending"
     *   and "descending". The property value of each is a comparator
     *   function, as described above.
     *
     *   If only the "ascending" function is provided (i.e. this parameter is
     *   a Function, not a Map), then the "descending" function is built
     *   dynamically by passing the two parameters to the "ascending" function
     *   in reversed order. <i>Use of a dynamically-built "descending" function
     *   generates at least one extra function call for each row in the table,
     *   and possibly many more. If the table is expected to have more than
     *   about 1000 rows, you will likely want to provide a map with a custom
     *   "descending" sort function as well as the "ascending" one.</i>
     *
     * @return {void}
     */
    setSortMethods : function(columnIndex, compare)
    {
      var methods;
      if (qx.lang.Type.isFunction(compare))
      {
        methods =
          {
            ascending  : compare,
            descending : function(row1, row2)
            {
              return compare(row2, row1);
            }
          };
      }
      else
      {
        methods = compare;
      }
      this.__sortMethods[columnIndex] = methods;
    },


    /**
     * Returns the sortMethod(s) for a table column.
     *
     * @param columnIndex {Integer} The index of the column for which the sort
     *   methods are being  provided.
     *
     * @return {Map} a map with the two properties "ascending"
     *   and "descending" for the specified column.
     *   The property value of each is a comparator function, as described
     *   in {@link #setSortMethods}.
     */
    getSortMethods : function(columnIndex) {
      return this.__sortMethods[columnIndex];
    },


    /**
     * Clears the sorting.
     */
    clearSorting : function()
    {
      if (this.__sortColumnIndex != -1)
      {
        this.__sortColumnIndex = -1;
        this.__sortAscending = true;

        this.fireEvent("metaDataChanged");
      }
    },

    // overridden
    getSortColumnIndex : function() {
      return this.__sortColumnIndex;
    },

    /**
     * Set the sort column index
     *
     * WARNING: This should be called only by subclasses with intimate
     *          knowledge of what they are doing!
     *
     * @param columnIndex {Integer} index of the column
     */
    _setSortColumnIndex : function(columnIndex)
    {
      this.__sortColumnIndex = columnIndex;
    },

    // overridden
    isSortAscending : function() {
      return this.__sortAscending;
    },

    /**
     * Set whether to sort in ascending order or not.
     *
     * WARNING: This should be called only by subclasses with intimate
     *          knowledge of what they are doing!
     *
     * @param ascending {Boolean}
     *   <i>true</i> for an ascending sort;
     *   <i> false</i> for a descending sort.
     */
    _setSortAscending : function(ascending)
    {
      this.__sortAscending = ascending;
    },

    // overridden
    getRowCount : function() {
      return this.__rowArr.length;
    },

    // overridden
    getValue : function(columnIndex, rowIndex)
    {
      if (rowIndex < 0 || rowIndex >= this.__rowArr.length) {
        throw new Error("this.__rowArr out of bounds: " + rowIndex + " (0.." + this.__rowArr.length + ")");
      }

      return this.__rowArr[rowIndex][columnIndex];
    },

    // overridden
    setValue : function(columnIndex, rowIndex, value)
    {
      if (this.__rowArr[rowIndex][columnIndex] != value)
      {
        this.__rowArr[rowIndex][columnIndex] = value;

        // Inform the listeners
        if (this.hasListener("dataChanged"))
        {
          var data =
          {
            firstRow    : rowIndex,
            lastRow     : rowIndex,
            firstColumn : columnIndex,
            lastColumn  : columnIndex
          };

          this.fireDataEvent("dataChanged", data);
        }

        if (columnIndex == this.__sortColumnIndex) {
          this.clearSorting();
        }
      }
    },


    /**
     * Sets the whole data in a bulk.
     *
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     * @return {void}
     */
    setData : function(rowArr, clearSorting)
    {
      this.__rowArr = rowArr;

      // Inform the listeners
      if (this.hasListener("dataChanged"))
      {
        var data =
        {
          firstRow    : 0,
          lastRow     : rowArr.length - 1,
          firstColumn : 0,
          lastColumn  : this.getColumnCount() - 1
        };

        this.fireDataEvent("dataChanged", data);
      }

      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Returns the data of this model.
     *
     * Warning: Do not alter this array! If you want to change the data use
     * {@link #setData}, {@link #setDataAsMapArray} or {@link #setValue} instead.
     *
     * @return {var[][]} An array containing an array for each row. Each
     *           row-array contains the values in that row in the order of the columns
     *           in this model.
     */
    getData : function() {
      return this.__rowArr;
    },


    /**
     * Sets the whole data in a bulk.
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *        row-map contains the column IDs as key and the cell values as value.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    setDataAsMapArray : function(mapArr, rememberMaps, clearSorting) {
      this.setData(this._mapArray2RowArr(mapArr, rememberMaps), clearSorting);
    },


    /**
     * Adds some rows to the model.
     *
     * Warning: The given array will be altered!
     *
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *          the rows are appended to the end.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     * @return {void}
     */
    addRows : function(rowArr, startIndex, clearSorting)
    {
      if (startIndex == null) {
        startIndex = this.__rowArr.length;
      }

      // Prepare the rowArr so it can be used for apply
      rowArr.splice(0, 0, startIndex, 0);

      // Insert the new rows
      Array.prototype.splice.apply(this.__rowArr, rowArr);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this.__rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };
      this.fireDataEvent("dataChanged", data);

      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Adds some rows to the model.
     *
     * Warning: The given array (mapArr) will be altered!
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *        row-map contains the column IDs as key and the cell values as value.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *        the rows are appended to the end.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    addRowsAsMapArray : function(mapArr, startIndex, rememberMaps, clearSorting) {
      this.addRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex, clearSorting);
    },


    /**
     * Sets rows in the model. The rows overwrite the old rows starting at
     * <code>startIndex</code> to <code>startIndex+rowArr.length</code>.
     *
     * Warning: The given array will be altered!
     *
     * @param rowArr {var[][]} An array containing an array for each row. Each
     *          row-array contains the values in that row in the order of the columns
     *          in this model.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *          the rows are set from the beginning (0).
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     * @return {void}
     */
    setRows : function(rowArr, startIndex, clearSorting)
    {
      if (startIndex == null) {
        startIndex = 0;
      }

      // Prepare the rowArr so it can be used for apply
      rowArr.splice(0, 0, startIndex, rowArr.length);

      // Replace rows
      Array.prototype.splice.apply(this.__rowArr, rowArr);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this.__rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1
      };
      this.fireDataEvent("dataChanged", data);

      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Set rows in the model. The rows overwrite the old rows starting at
     * <code>startIndex</code> to <code>startIndex+rowArr.length</code>.
     *
     * Warning: The given array (mapArr) will be altered!
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *        row-map contains the column IDs as key and the cell values as value.
     * @param startIndex {Integer ? null} The index where to insert the new rows. If null,
     *        the rows are appended to the end.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     */
    setRowsAsMapArray : function(mapArr, startIndex, rememberMaps, clearSorting) {
      this.setRows(this._mapArray2RowArr(mapArr, rememberMaps), startIndex, clearSorting);
    },


    /**
     * Removes some rows from the model.
     *
     * @param startIndex {Integer} the index of the first row to remove.
     * @param howMany {Integer} the number of rows to remove.
     * @param clearSorting {Boolean ? true} Whether to clear the sort state.
     * @return {void}
     */
    removeRows : function(startIndex, howMany, clearSorting)
    {
      this.__rowArr.splice(startIndex, howMany);

      // Inform the listeners
      var data =
      {
        firstRow    : startIndex,
        lastRow     : this.__rowArr.length - 1,
        firstColumn : 0,
        lastColumn  : this.getColumnCount() - 1,
        removeStart : startIndex,
        removeCount : howMany
      };

      this.fireDataEvent("dataChanged", data);
      if (clearSorting !== false) {
        this.clearSorting();
      }
    },


    /**
     * Creates an array of maps to an array of arrays.
     *
     * @param mapArr {Map[]} An array containing a map for each row. Each
     *          row-map contains the column IDs as key and the cell values as value.
     * @param rememberMaps {Boolean ? false} Whether to remember the original maps.
     *        If true {@link #getRowData} will return the original map.
     * @return {var[][]} An array containing an array for each row. Each
     *           row-array contains the values in that row in the order of the columns
     *           in this model.
     */
    _mapArray2RowArr : function(mapArr, rememberMaps)
    {
      var rowCount = mapArr.length;
      var columnCount = this.getColumnCount();
      var dataArr = new Array(rowCount);
      var columnArr;

      for (var i=0; i<rowCount; ++i)
      {
      columnArr = [];
      if (rememberMaps) {
        columnArr.originalData = mapArr[i];
      }

        for (var j=0; j<columnCount; ++j) {
          columnArr[j] = mapArr[i][this.getColumnId(j)];
        }

        dataArr[i] = columnArr;
      }

      return dataArr;
    }
  },


  destruct : function()
  {
    this.__rowArr = this.__editableColArr = this.__sortMethods =
      this.__sortableColArr = null;
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

************************************************************************ */

/**
 * A cell renderer for data cells.
 */
qx.Interface.define("qx.ui.table.ICellRenderer",
{

  members :
  {
    /**
     * Creates the HTML for a data cell.
     *
     * The cellInfo map contains the following properties:
     * <ul>
     * <li>value (var): the cell's value.</li>
     * <li>rowData (var): contains the row data for the row, the cell belongs to.
     *   The kind of this object depends on the table model, see
     *   {@link qx.ui.table.ITableModel#getRowData}</li>
     * <li>row (int): the model index of the row the cell belongs to.</li>
     * <li>col (int): the model index of the column the cell belongs to.</li>
     * <li>table (qx.ui.table.Table): the table the cell belongs to.</li>
     * <li>xPos (int): the x position of the cell in the table pane.</li>
     * <li>selected (boolean): whether the cell is selected.</li>
     * <li>focusedRow (boolean): whether the cell is in the same row as the
     *   focused cell.</li>
     * <li>editable (boolean): whether the cell is editable.</li>
     * <li>style (string): The CSS styles that should be applied to the outer HTML
     *   element.</li>
     * <li>styleLeft (string): The left position of the cell.</li>
     * <li>styleWidth (string): The cell's width (pixel).</li>
     * <li>styleHeight (string): The cell's height (pixel).</li>
     * </ul>
     *
     * @param cellInfo {Map} A map containing the information about the cell to
     *     create.
     * @param htmlArr {String[]} Target string container. The HTML of the data
     *     cell should be appended to this array.
     *
     * @return {Boolean|undefined}
     *   A return value of <i>true</i> specifies that no additional cells in
     *   the row shall be rendered. This may be used, for example, for
     *   separator rows or for other special rendering purposes. Traditional
     *   cell renderers had no defined return value, so returned nothing
     *   (undefined). If this method returns either false or nothing, then
     *   rendering continues with the next cell in the row, which the normal
     *   mode of operation.
     */
    createDataCellHtml : function(cellInfo, htmlArr) {
      return true;
    }

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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************
#require(qx.bom.Stylesheet)
************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.Class.define("qx.ui.table.cellrenderer.Abstract",
{
  type : "abstract",
  implement : qx.ui.table.ICellRenderer,
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    var cr = qx.ui.table.cellrenderer.Abstract;
    if (!cr.__clazz)
    {
      var colorMgr = qx.theme.manager.Color.getInstance();
      cr.__clazz = this.self(arguments);
      var stylesheet =
        ".qooxdoo-table-cell {" +
        qx.bom.element.Style.compile(
        {
          position : "absolute",
          top: "0px",
          overflow: "hidden",
          whiteSpace : "nowrap",
          borderRight : "1px solid " + colorMgr.resolve("table-column-line"),
          padding : "0px 6px",
          cursor : "default",
          textOverflow : "ellipsis",
          userSelect : "none"
        }) +
        "} " +
        ".qooxdoo-table-cell-right { text-align:right } " +
        ".qooxdoo-table-cell-italic { font-style:italic} " +
        ".qooxdoo-table-cell-bold { font-weight:bold } ";

      if (qx.core.Environment.get("css.boxsizing")) {
        stylesheet += ".qooxdoo-table-cell {" + qx.bom.element.BoxSizing.compile("content-box") + "}";
      }

      cr.__clazz.stylesheet = qx.bom.Stylesheet.createElement(stylesheet);
    }
  },


  properties :
  {
    /**
     * The default cell style. The value of this property will be provided
     * to the cell renderer as cellInfo.style.
     */
    defaultCellStyle :
    {
      init : null,
      check : "String",
      nullable : true
    }
  },


  members :
  {
    /**
     * the sum of the horizontal insets. This is needed to compute the box model
     * independent size
     */
    _insetX : 6+6+1, // paddingLeft + paddingRight + borderRight

    /**
     * the sum of the vertical insets. This is needed to compute the box model
     * independent size
     */
    _insetY : 0,



    /**
     * Get a string of the cell element's HTML classes.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} cellInfo of the cell
     * @return {String} The table cell HTML classes as string.
     */
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    },


    /**
     * Returns the CSS styles that should be applied to the main div of this
     * cell.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {var} the CSS styles of the main div.
     */
    _getCellStyle : function(cellInfo) {
      return cellInfo.style || "";
    },


   /**
     * Retrieve any extra attributes the cell renderer wants applied to this
     * cell. Extra attributes could be such things as
     * "onclick='handleClick()';"
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     *
     * @return {String}
     *   The extra attributes to be applied to this cell.
     */
    _getCellAttributes : function(cellInfo)
    {
      return "";
    },


    /**
     * Returns the HTML that should be used inside the main div of this cell.
     *
     * This method may be overridden by sub classes.
     *
     * @param cellInfo {Map} The information about the cell.
     *          See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {String} the inner HTML of the cell.
     */
    _getContentHtml : function(cellInfo) {
      return cellInfo.value || "";
    },


    /**
     * Get the cell size taking the box model into account
     *
     * @param width {Integer} The cell's (border-box) width in pixel
     * @param height {Integer} The cell's (border-box) height in pixel
     * @param insetX {Integer} The cell's horizontal insets, i.e. the sum of
     *    horizontal paddings and borders
     * @param insetY {Integer} The cell's vertical insets, i.e. the sum of
     *    vertical paddings and borders
     * @return {String} The CSS style string for the cell size
     */
    _getCellSizeStyle : function(width, height, insetX, insetY)
    {
      var style = "";
      if (qx.core.Environment.get("css.boxmodel") == "content")
      {
        width -= insetX;
        height -= insetY;
      }

      style += "width:" + Math.max(width, 0) + "px;";
      style += "height:" + Math.max(height, 0) + "px;";

      return style;
    },


    // interface implementation
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      htmlArr.push(
        '<div class="',
        this._getCellClass(cellInfo),
        '" style="',
        'left:', cellInfo.styleLeft, 'px;',
        this._getCellSizeStyle(cellInfo.styleWidth, cellInfo.styleHeight, this._insetX, this._insetY),
        this._getCellStyle(cellInfo), '" ',
        this._getCellAttributes(cellInfo),
        '>' +
        this._getContentHtml(cellInfo),
        '</div>'
      );
    }

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

************************************************************************ */

/**
 * The default data cell renderer.
 */
qx.Class.define("qx.ui.table.cellrenderer.Default",
{
  extend : qx.ui.table.cellrenderer.Abstract,


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    STYLEFLAG_ALIGN_RIGHT : 1,
    STYLEFLAG_BOLD : 2,
    STYLEFLAG_ITALIC : 4,
    _numberFormat : null
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the alignment should automatically be set according to the cell value.
     * If true numbers will be right-aligned.
     */
    useAutoAlign :
    {
      check : "Boolean",
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Determines the styles to apply to the cell
     *
     * @param cellInfo {Map} cellInfo of the cell
     *     See {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {Integer} the sum of any of the STYLEFLAGS defined below
     */
    _getStyleFlags : function(cellInfo)
    {
      if (this.getUseAutoAlign())
      {
        if (typeof cellInfo.value == "number") {
          return qx.ui.table.cellrenderer.Default.STYLEFLAG_ALIGN_RIGHT;
        }
      }
      return 0;
    },


    // overridden
    _getCellClass : function(cellInfo)
    {
      var cellClass = this.base(arguments, cellInfo);
      if (!cellClass) {
        return "";
      }

      var stylesToApply = this._getStyleFlags(cellInfo);

      if (stylesToApply & qx.ui.table.cellrenderer.Default.STYLEFLAG_ALIGN_RIGHT) {
        cellClass += " qooxdoo-table-cell-right";
      }

      if (stylesToApply & qx.ui.table.cellrenderer.Default.STYLEFLAG_BOLD) {
        cellClass += " qooxdoo-table-cell-bold";
      }

      if (stylesToApply & qx.ui.table.cellrenderer.Default.STYLEFLAG_ITALIC) {
        cellClass += " qooxdoo-table-cell-italic";
      }

      return cellClass;
    },


    // overridden
    _getContentHtml : function(cellInfo) {
      return qx.bom.String.escape(this._formatValue(cellInfo));
    },


    /**
     * Formats a value.
     *
     * @param cellInfo {Map} A map containing the information about the cell to
     *          create. This map has the same structure as in
     *          {@link qx.ui.table.cellrenderer.Abstract#createDataCellHtml}.
     * @return {String} the formatted value.
     */
    _formatValue : function(cellInfo)
    {
      var value = cellInfo.value;
      var res;

      if (value == null) {
        return "";
      }

      if (typeof value == "string") {
        return value;
      }
      else if (typeof value == "number")
      {
        if (!qx.ui.table.cellrenderer.Default._numberFormat)
        {
          qx.ui.table.cellrenderer.Default._numberFormat = new qx.util.format.NumberFormat();
          qx.ui.table.cellrenderer.Default._numberFormat.setMaximumFractionDigits(2);
        }

        res = qx.ui.table.cellrenderer.Default._numberFormat.format(value);
      }
      else if (value instanceof Date)
      {
        res = qx.util.format.DateFormat.getDateInstance().format(value);
      }
      else
      {
        res = value.toString();
      }

      return res;
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Collection of utility functions to escape and unescape strings.
 */
qx.Class.define("qx.bom.String",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Mapping of HTML entity names to the corresponding char code */
    TO_CHARCODE :
    {
      "quot"     : 34, // " - double-quote
      "amp"      : 38, // &
      "lt"       : 60, // <
      "gt"       : 62, // >

      // http://www.w3.org/TR/REC-html40/sgml/entities.html
      // ISO 8859-1 characters
      "nbsp"     : 160, // no-break space
      "iexcl"    : 161, // inverted exclamation mark
      "cent"     : 162, // cent sign
      "pound"    : 163, // pound sterling sign
      "curren"   : 164, // general currency sign
      "yen"      : 165, // yen sign
      "brvbar"   : 166, // broken (vertical) bar
      "sect"     : 167, // section sign
      "uml"      : 168, // umlaut (dieresis)
      "copy"     : 169, // copyright sign
      "ordf"     : 170, // ordinal indicator, feminine
      "laquo"    : 171, // angle quotation mark, left
      "not"      : 172, // not sign
      "shy"      : 173, // soft hyphen
      "reg"      : 174, // registered sign
      "macr"     : 175, // macron
      "deg"      : 176, // degree sign
      "plusmn"   : 177, // plus-or-minus sign
      "sup2"     : 178, // superscript two
      "sup3"     : 179, // superscript three
      "acute"    : 180, // acute accent
      "micro"    : 181, // micro sign
      "para"     : 182, // pilcrow (paragraph sign)
      "middot"   : 183, // middle dot
      "cedil"    : 184, // cedilla
      "sup1"     : 185, // superscript one
      "ordm"     : 186, // ordinal indicator, masculine
      "raquo"    : 187, // angle quotation mark, right
      "frac14"   : 188, // fraction one-quarter
      "frac12"   : 189, // fraction one-half
      "frac34"   : 190, // fraction three-quarters
      "iquest"   : 191, // inverted question mark
      "Agrave"   : 192, // capital A, grave accent
      "Aacute"   : 193, // capital A, acute accent
      "Acirc"    : 194, // capital A, circumflex accent
      "Atilde"   : 195, // capital A, tilde
      "Auml"     : 196, // capital A, dieresis or umlaut mark
      "Aring"    : 197, // capital A, ring
      "AElig"    : 198, // capital AE diphthong (ligature)
      "Ccedil"   : 199, // capital C, cedilla
      "Egrave"   : 200, // capital E, grave accent
      "Eacute"   : 201, // capital E, acute accent
      "Ecirc"    : 202, // capital E, circumflex accent
      "Euml"     : 203, // capital E, dieresis or umlaut mark
      "Igrave"   : 204, // capital I, grave accent
      "Iacute"   : 205, // capital I, acute accent
      "Icirc"    : 206, // capital I, circumflex accent
      "Iuml"     : 207, // capital I, dieresis or umlaut mark
      "ETH"      : 208, // capital Eth, Icelandic
      "Ntilde"   : 209, // capital N, tilde
      "Ograve"   : 210, // capital O, grave accent
      "Oacute"   : 211, // capital O, acute accent
      "Ocirc"    : 212, // capital O, circumflex accent
      "Otilde"   : 213, // capital O, tilde
      "Ouml"     : 214, // capital O, dieresis or umlaut mark
      "times"    : 215, // multiply sign
      "Oslash"   : 216, // capital O, slash
      "Ugrave"   : 217, // capital U, grave accent
      "Uacute"   : 218, // capital U, acute accent
      "Ucirc"    : 219, // capital U, circumflex accent
      "Uuml"     : 220, // capital U, dieresis or umlaut mark
      "Yacute"   : 221, // capital Y, acute accent
      "THORN"    : 222, // capital THORN, Icelandic
      "szlig"    : 223, // small sharp s, German (sz ligature)
      "agrave"   : 224, // small a, grave accent
      "aacute"   : 225, // small a, acute accent
      "acirc"    : 226, // small a, circumflex accent
      "atilde"   : 227, // small a, tilde
      "auml"     : 228, // small a, dieresis or umlaut mark
      "aring"    : 229, // small a, ring
      "aelig"    : 230, // small ae diphthong (ligature)
      "ccedil"   : 231, // small c, cedilla
      "egrave"   : 232, // small e, grave accent
      "eacute"   : 233, // small e, acute accent
      "ecirc"    : 234, // small e, circumflex accent
      "euml"     : 235, // small e, dieresis or umlaut mark
      "igrave"   : 236, // small i, grave accent
      "iacute"   : 237, // small i, acute accent
      "icirc"    : 238, // small i, circumflex accent
      "iuml"     : 239, // small i, dieresis or umlaut mark
      "eth"      : 240, // small eth, Icelandic
      "ntilde"   : 241, // small n, tilde
      "ograve"   : 242, // small o, grave accent
      "oacute"   : 243, // small o, acute accent
      "ocirc"    : 244, // small o, circumflex accent
      "otilde"   : 245, // small o, tilde
      "ouml"     : 246, // small o, dieresis or umlaut mark
      "divide"   : 247, // divide sign
      "oslash"   : 248, // small o, slash
      "ugrave"   : 249, // small u, grave accent
      "uacute"   : 250, // small u, acute accent
      "ucirc"    : 251, // small u, circumflex accent
      "uuml"     : 252, // small u, dieresis or umlaut mark
      "yacute"   : 253, // small y, acute accent
      "thorn"    : 254, // small thorn, Icelandic
      "yuml"     : 255, // small y, dieresis or umlaut mark

      // Latin Extended-B
      "fnof"     : 402, // latin small f with hook = function= florin, U+0192 ISOtech

      // Greek
      "Alpha"    : 913, // greek capital letter alpha, U+0391
      "Beta"     : 914, // greek capital letter beta, U+0392
      "Gamma"    : 915, // greek capital letter gamma,U+0393 ISOgrk3
      "Delta"    : 916, // greek capital letter delta,U+0394 ISOgrk3
      "Epsilon"  : 917, // greek capital letter epsilon, U+0395
      "Zeta"     : 918, // greek capital letter zeta, U+0396
      "Eta"      : 919, // greek capital letter eta, U+0397
      "Theta"    : 920, // greek capital letter theta,U+0398 ISOgrk3
      "Iota"     : 921, // greek capital letter iota, U+0399
      "Kappa"    : 922, // greek capital letter kappa, U+039A
      "Lambda"   : 923, // greek capital letter lambda,U+039B ISOgrk3
      "Mu"       : 924, // greek capital letter mu, U+039C
      "Nu"       : 925, // greek capital letter nu, U+039D
      "Xi"       : 926, // greek capital letter xi, U+039E ISOgrk3
      "Omicron"  : 927, // greek capital letter omicron, U+039F
      "Pi"       : 928, // greek capital letter pi, U+03A0 ISOgrk3
      "Rho"      : 929, // greek capital letter rho, U+03A1

      // there is no Sigmaf, and no U+03A2 character either
      "Sigma"    : 931, // greek capital letter sigma,U+03A3 ISOgrk3
      "Tau"      : 932, // greek capital letter tau, U+03A4
      "Upsilon"  : 933, // greek capital letter upsilon,U+03A5 ISOgrk3
      "Phi"      : 934, // greek capital letter phi,U+03A6 ISOgrk3
      "Chi"      : 935, // greek capital letter chi, U+03A7
      "Psi"      : 936, // greek capital letter psi,U+03A8 ISOgrk3
      "Omega"    : 937, // greek capital letter omega,U+03A9 ISOgrk3
      "alpha"    : 945, // greek small letter alpha,U+03B1 ISOgrk3
      "beta"     : 946, // greek small letter beta, U+03B2 ISOgrk3
      "gamma"    : 947, // greek small letter gamma,U+03B3 ISOgrk3
      "delta"    : 948, // greek small letter delta,U+03B4 ISOgrk3
      "epsilon"  : 949, // greek small letter epsilon,U+03B5 ISOgrk3
      "zeta"     : 950, // greek small letter zeta, U+03B6 ISOgrk3
      "eta"      : 951, // greek small letter eta, U+03B7 ISOgrk3
      "theta"    : 952, // greek small letter theta,U+03B8 ISOgrk3
      "iota"     : 953, // greek small letter iota, U+03B9 ISOgrk3
      "kappa"    : 954, // greek small letter kappa,U+03BA ISOgrk3
      "lambda"   : 955, // greek small letter lambda,U+03BB ISOgrk3
      "mu"       : 956, // greek small letter mu, U+03BC ISOgrk3
      "nu"       : 957, // greek small letter nu, U+03BD ISOgrk3
      "xi"       : 958, // greek small letter xi, U+03BE ISOgrk3
      "omicron"  : 959, // greek small letter omicron, U+03BF NEW
      "pi"       : 960, // greek small letter pi, U+03C0 ISOgrk3
      "rho"      : 961, // greek small letter rho, U+03C1 ISOgrk3
      "sigmaf"   : 962, // greek small letter final sigma,U+03C2 ISOgrk3
      "sigma"    : 963, // greek small letter sigma,U+03C3 ISOgrk3
      "tau"      : 964, // greek small letter tau, U+03C4 ISOgrk3
      "upsilon"  : 965, // greek small letter upsilon,U+03C5 ISOgrk3
      "phi"      : 966, // greek small letter phi, U+03C6 ISOgrk3
      "chi"      : 967, // greek small letter chi, U+03C7 ISOgrk3
      "psi"      : 968, // greek small letter psi, U+03C8 ISOgrk3
      "omega"    : 969, // greek small letter omega,U+03C9 ISOgrk3
      "thetasym" : 977, // greek small letter theta symbol,U+03D1 NEW
      "upsih"    : 978, // greek upsilon with hook symbol,U+03D2 NEW
      "piv"      : 982, // greek pi symbol, U+03D6 ISOgrk3

      // General Punctuation
      "bull"     : 8226, // bullet = black small circle,U+2022 ISOpub

      // bullet is NOT the same as bullet operator, U+2219
      "hellip"   : 8230, // horizontal ellipsis = three dot leader,U+2026 ISOpub
      "prime"    : 8242, // prime = minutes = feet, U+2032 ISOtech
      "Prime"    : 8243, // double prime = seconds = inches,U+2033 ISOtech
      "oline"    : 8254, // overline = spacing overscore,U+203E NEW
      "frasl"    : 8260, // fraction slash, U+2044 NEW

      // Letterlike Symbols
      "weierp"   : 8472, // script capital P = power set= Weierstrass p, U+2118 ISOamso
      "image"    : 8465, // blackletter capital I = imaginary part,U+2111 ISOamso
      "real"     : 8476, // blackletter capital R = real part symbol,U+211C ISOamso
      "trade"    : 8482, // trade mark sign, U+2122 ISOnum
      "alefsym"  : 8501, // alef symbol = first transfinite cardinal,U+2135 NEW

      // alef symbol is NOT the same as hebrew letter alef,U+05D0 although the same glyph could be used to depict both characters
      // Arrows
      "larr"     : 8592, // leftwards arrow, U+2190 ISOnum
      "uarr"     : 8593, // upwards arrow, U+2191 ISOnum-->
      "rarr"     : 8594, // rightwards arrow, U+2192 ISOnum
      "darr"     : 8595, // downwards arrow, U+2193 ISOnum
      "harr"     : 8596, // left right arrow, U+2194 ISOamsa
      "crarr"    : 8629, // downwards arrow with corner leftwards= carriage return, U+21B5 NEW
      "lArr"     : 8656, // leftwards double arrow, U+21D0 ISOtech

      // ISO 10646 does not say that lArr is the same as the 'is implied by' arrowbut also does not have any other character for that function. So ? lArr canbe used for 'is implied by' as ISOtech suggests
      "uArr"     : 8657, // upwards double arrow, U+21D1 ISOamsa
      "rArr"     : 8658, // rightwards double arrow,U+21D2 ISOtech

      // ISO 10646 does not say this is the 'implies' character but does not have another character with this function so ?rArr can be used for 'implies' as ISOtech suggests
      "dArr"     : 8659, // downwards double arrow, U+21D3 ISOamsa
      "hArr"     : 8660, // left right double arrow,U+21D4 ISOamsa

      // Mathematical Operators
      "forall"   : 8704, // for all, U+2200 ISOtech
      "part"     : 8706, // partial differential, U+2202 ISOtech
      "exist"    : 8707, // there exists, U+2203 ISOtech
      "empty"    : 8709, // empty set = null set = diameter,U+2205 ISOamso
      "nabla"    : 8711, // nabla = backward difference,U+2207 ISOtech
      "isin"     : 8712, // element of, U+2208 ISOtech
      "notin"    : 8713, // not an element of, U+2209 ISOtech
      "ni"       : 8715, // contains as member, U+220B ISOtech

      // should there be a more memorable name than 'ni'?
      "prod"     : 8719, // n-ary product = product sign,U+220F ISOamsb

      // prod is NOT the same character as U+03A0 'greek capital letter pi' though the same glyph might be used for both
      "sum"      : 8721, // n-ary summation, U+2211 ISOamsb

      // sum is NOT the same character as U+03A3 'greek capital letter sigma' though the same glyph might be used for both
      "minus"    : 8722, // minus sign, U+2212 ISOtech
      "lowast"   : 8727, // asterisk operator, U+2217 ISOtech
      "radic"    : 8730, // square root = radical sign,U+221A ISOtech
      "prop"     : 8733, // proportional to, U+221D ISOtech
      "infin"    : 8734, // infinity, U+221E ISOtech
      "ang"      : 8736, // angle, U+2220 ISOamso
      "and"      : 8743, // logical and = wedge, U+2227 ISOtech
      "or"       : 8744, // logical or = vee, U+2228 ISOtech
      "cap"      : 8745, // intersection = cap, U+2229 ISOtech
      "cup"      : 8746, // union = cup, U+222A ISOtech
      "int"      : 8747, // integral, U+222B ISOtech
      "there4"   : 8756, // therefore, U+2234 ISOtech
      "sim"      : 8764, // tilde operator = varies with = similar to,U+223C ISOtech

      // tilde operator is NOT the same character as the tilde, U+007E,although the same glyph might be used to represent both
      "cong"     : 8773, // approximately equal to, U+2245 ISOtech
      "asymp"    : 8776, // almost equal to = asymptotic to,U+2248 ISOamsr
      "ne"       : 8800, // not equal to, U+2260 ISOtech
      "equiv"    : 8801, // identical to, U+2261 ISOtech
      "le"       : 8804, // less-than or equal to, U+2264 ISOtech
      "ge"       : 8805, // greater-than or equal to,U+2265 ISOtech
      "sub"      : 8834, // subset of, U+2282 ISOtech
      "sup"      : 8835, // superset of, U+2283 ISOtech

      // note that nsup, 'not a superset of, U+2283' is not covered by the Symbol font encoding and is not included. Should it be, for symmetry?It is in ISOamsn  --> <!ENTITY nsub": 8836,  //not a subset of, U+2284 ISOamsn
      "sube"     : 8838, // subset of or equal to, U+2286 ISOtech
      "supe"     : 8839, // superset of or equal to,U+2287 ISOtech
      "oplus"    : 8853, // circled plus = direct sum,U+2295 ISOamsb
      "otimes"   : 8855, // circled times = vector product,U+2297 ISOamsb
      "perp"     : 8869, // up tack = orthogonal to = perpendicular,U+22A5 ISOtech
      "sdot"     : 8901, // dot operator, U+22C5 ISOamsb

      // dot operator is NOT the same character as U+00B7 middle dot
      // Miscellaneous Technical
      "lceil"    : 8968, // left ceiling = apl upstile,U+2308 ISOamsc
      "rceil"    : 8969, // right ceiling, U+2309 ISOamsc
      "lfloor"   : 8970, // left floor = apl downstile,U+230A ISOamsc
      "rfloor"   : 8971, // right floor, U+230B ISOamsc
      "lang"     : 9001, // left-pointing angle bracket = bra,U+2329 ISOtech

      // lang is NOT the same character as U+003C 'less than' or U+2039 'single left-pointing angle quotation mark'
      "rang"     : 9002, // right-pointing angle bracket = ket,U+232A ISOtech

      // rang is NOT the same character as U+003E 'greater than' or U+203A 'single right-pointing angle quotation mark'
      // Geometric Shapes
      "loz"      : 9674, // lozenge, U+25CA ISOpub

      // Miscellaneous Symbols
      "spades"   : 9824, // black spade suit, U+2660 ISOpub

      // black here seems to mean filled as opposed to hollow
      "clubs"    : 9827, // black club suit = shamrock,U+2663 ISOpub
      "hearts"   : 9829, // black heart suit = valentine,U+2665 ISOpub
      "diams"    : 9830, // black diamond suit, U+2666 ISOpub

      // Latin Extended-A
      "OElig"    : 338, //  -- latin capital ligature OE,U+0152 ISOlat2
      "oelig"    : 339, //  -- latin small ligature oe, U+0153 ISOlat2

      // ligature is a misnomer, this is a separate character in some languages
      "Scaron"   : 352, //  -- latin capital letter S with caron,U+0160 ISOlat2
      "scaron"   : 353, //  -- latin small letter s with caron,U+0161 ISOlat2
      "Yuml"     : 376, //  -- latin capital letter Y with diaeresis,U+0178 ISOlat2

      // Spacing Modifier Letters
      "circ"     : 710, //  -- modifier letter circumflex accent,U+02C6 ISOpub
      "tilde"    : 732, // small tilde, U+02DC ISOdia

      // General Punctuation
      "ensp"     : 8194, // en space, U+2002 ISOpub
      "emsp"     : 8195, // em space, U+2003 ISOpub
      "thinsp"   : 8201, // thin space, U+2009 ISOpub
      "zwnj"     : 8204, // zero width non-joiner,U+200C NEW RFC 2070
      "zwj"      : 8205, // zero width joiner, U+200D NEW RFC 2070
      "lrm"      : 8206, // left-to-right mark, U+200E NEW RFC 2070
      "rlm"      : 8207, // right-to-left mark, U+200F NEW RFC 2070
      "ndash"    : 8211, // en dash, U+2013 ISOpub
      "mdash"    : 8212, // em dash, U+2014 ISOpub
      "lsquo"    : 8216, // left single quotation mark,U+2018 ISOnum
      "rsquo"    : 8217, // right single quotation mark,U+2019 ISOnum
      "sbquo"    : 8218, // single low-9 quotation mark, U+201A NEW
      "ldquo"    : 8220, // left double quotation mark,U+201C ISOnum
      "rdquo"    : 8221, // right double quotation mark,U+201D ISOnum
      "bdquo"    : 8222, // double low-9 quotation mark, U+201E NEW
      "dagger"   : 8224, // dagger, U+2020 ISOpub
      "Dagger"   : 8225, // double dagger, U+2021 ISOpub
      "permil"   : 8240, // per mille sign, U+2030 ISOtech
      "lsaquo"   : 8249, // single left-pointing angle quotation mark,U+2039 ISO proposed
      // lsaquo is proposed but not yet ISO standardized
      "rsaquo"   : 8250, // single right-pointing angle quotation mark,U+203A ISO proposed
      // rsaquo is proposed but not yet ISO standardized
      "euro"     : 8364 //  -- euro sign, U+20AC NEW
    },


    /**
     * Escapes the characters in a <code>String</code> using HTML entities.
     *
     * For example: <tt>"bread" & "butter"</tt> => <tt>&amp;quot;bread&amp;quot; &amp;amp; &amp;quot;butter&amp;quot;</tt>.
     * Supports all known HTML 4.0 entities, including funky accents.
     *
     * * <a href="http://www.w3.org/TR/REC-html32#latin1">HTML 3.2 Character Entities for ISO Latin-1</a>
     * * <a href="http://www.w3.org/TR/REC-html40/sgml/entities.html">HTML 4.0 Character entity references</a>
     * * <a href="http://www.w3.org/TR/html401/charset.html#h-5.3">HTML 4.01 Character References</a>
     * * <a href="http://www.w3.org/TR/html401/charset.html#code-position">HTML 4.01 Code positions</a>
     *
     * @param str {String} the String to escape
     * @return {String} a new escaped String
     * @see #unescape
     */
    escape : function(str) {
      return qx.util.StringEscape.escape(str, qx.bom.String.FROM_CHARCODE);
    },


    /**
     * Unescapes a string containing entity escapes to a string
     * containing the actual Unicode characters corresponding to the
     * escapes. Supports HTML 4.0 entities.
     *
     * For example, the string "&amp;lt;Fran&amp;ccedil;ais&amp;gt;"
     * will become "&lt;Fran&ccedil;ais&gt;"
     *
     * If an entity is unrecognized, it is left alone, and inserted
     * verbatim into the result string. e.g. "&amp;gt;&amp;zzzz;x" will
     * become "&gt;&amp;zzzz;x".
     *
     * @param str {String} the String to unescape, may be null
     * @return {var} a new unescaped String
     * @see #escape
     */
    unescape : function(str) {
      return qx.util.StringEscape.unescape(str, qx.bom.String.TO_CHARCODE);
    },


    /**
     * Converts a plain text string into HTML.
     * This is similar to {@link #escape} but converts new lines to
     * <tt>&lt:br&gt:</tt> and preserves whitespaces.
     *
     * @param str {String} the String to convert
     * @return {String} a new converted String
     * @see #escape
     */
    fromText : function(str)
    {
      return qx.bom.String.escape(str).replace(/(  |\n)/g, function(chr)
      {
        var map =
        {
          "  " : " &nbsp;",
          "\n" : "<br>"
        };

        return map[chr] || chr;
      });
    },


    /**
     * Converts HTML to plain text.
     *
     * * Strips all HTML tags
     * * converts <tt>&lt:br&gt:</tt> to new line
     * * unescapes HTML entities
     *
     * @param str {String} HTML string to converts
     * @return {String} plain text representation of the HTML string
     */
    toText : function(str)
    {
      return qx.bom.String.unescape(str.replace(/\s+|<([^>])+>/gi, function(chr)
      //return qx.bom.String.unescape(str.replace(/<\/?[^>]+(>|$)/gi, function(chr)
      {
        if (chr.indexOf("<br") === 0) {
          return "\n";
        } else if (chr.length > 0 && chr.replace(/^\s*/, "").replace(/\s*$/, "") == "") {
          return " ";
        } else {
          return "";
        }
      }));
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    /** Mapping of char codes to HTML entity names */
    statics.FROM_CHARCODE = qx.lang.Object.invert(statics.TO_CHARCODE)
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Generic escaping and unescaping of DOM strings.
 *
 * {@link qx.bom.String} for (un)escaping of HTML strings.
 * {@link qx.xml.String} for (un)escaping of XML strings.
 */
qx.Class.define("qx.util.StringEscape",
{
  statics :
  {
    /**
     * generic escaping method
     *
     * @param str {String} string to escape
     * @param charCodeToEntities {Map} entity to charcode map
     * @return {String} escaped string
     * @signature function(str, charCodeToEntities)
     */
    escape : function(str, charCodeToEntities)
    {
      var entity, result = "";

      for (var i=0, l=str.length; i<l; i++)
      {
        var chr = str.charAt(i);
        var code = chr.charCodeAt(0);

        if (charCodeToEntities[code]) {
          entity = "&" + charCodeToEntities[code] + ";";
        }
        else
        {
          if (code > 0x7F) {
            entity = "&#" + code + ";";
          } else {
            entity = chr;
          }
        }

        result += entity;
      }

      return result;
    },


    /**
     * generic unescaping method
     *
     * @param str {String} string to unescape
     * @param entitiesToCharCode {Map} charcode to entity map
     * @return {String} unescaped string
     */
    unescape : function(str, entitiesToCharCode)
    {
      return str.replace(/&[#\w]+;/gi, function(entity)
      {
        var chr = entity;
        var entity = entity.substring(1, entity.length - 1);
        var code = entitiesToCharCode[entity];

        if (code) {
          chr = String.fromCharCode(code);
        }
        else
        {
          if (entity.charAt(0) == '#')
          {
            if (entity.charAt(1).toUpperCase() == 'X')
            {
              code = entity.substring(2);

              // match hex number
              if (code.match(/^[0-9A-Fa-f]+$/gi)) {
                chr = String.fromCharCode(parseInt(code, 16));
              }
            }
            else
            {
              code = entity.substring(1);

              // match integer
              if (code.match(/^\d+$/gi)) {
                chr = String.fromCharCode(parseInt(code, 10));
              }
            }
          }
        }

        return chr;
      });
    }
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

************************************************************************ */

/**
 * Superclass for formatters and parsers.
 */
qx.Interface.define("qx.util.format.IFormat",
{

  members :
  {
    /**
     * Formats an object.
     *
     * @abstract
     * @param obj {var} The object to format.
     * @return {String} the formatted object.
     * @throws the abstract function warning.
     */
    format : function(obj) {},


    /**
     * Parses an object.
     *
     * @abstract
     * @param str {String} the string to parse.
     * @return {var} the parsed object.
     * @throws the abstract function warning.
     */
    parse : function(str) {}
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

************************************************************************ */

/**
 * A formatter and parser for numbers.
 */
qx.Class.define("qx.util.format.NumberFormat",
{
  extend : qx.core.Object,
  implement : qx.util.format.IFormat,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param locale {String} optional locale to be used
   */
  construct : function(locale)
  {
    this.base(arguments);
    this.__locale = locale;
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The minimum number of integer digits (digits before the decimal separator).
     * Missing digits will be filled up with 0 ("19" -> "0019").
     */
    minimumIntegerDigits :
    {
      check : "Number",
      init : 0
    },


    /**
     * The maximum number of integer digits (superfluous digits will be cut off
     * ("1923" -> "23").
     */
    maximumIntegerDigits :
    {
      check : "Number",
      nullable : true
    },


    /**
     * The minimum number of fraction digits (digits after the decimal separator).
     * Missing digits will be filled up with 0 ("1.5" -> "1.500")
     */
    minimumFractionDigits :
    {
      check : "Number",
      init : 0
    },


    /**
     * The maximum number of fraction digits (digits after the decimal separator).
     * Superfluous digits will cause rounding ("1.8277" -> "1.83")
     */
    maximumFractionDigits :
    {
      check : "Number",
      nullable : true
    },


    /** Whether thousand groupings should be used {e.g. "1,432,234.65"}. */
    groupingUsed :
    {
      check : "Boolean",
      init : true
    },


    /** The prefix to put before the number {"EUR " -> "EUR 12.31"}. */
    prefix :
    {
      check : "String",
      init : "",
      event : "changeNumberFormat"
    },


    /** Sets the postfix to put after the number {" %" -> "56.13 %"}. */
    postfix :
    {
      check : "String",
      init : "",
      event : "changeNumberFormat"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __locale : null,

    /**
     * Formats a number.
     *
     * @param num {Number} the number to format.
     * @return {String} the formatted number as a string.
     */
    format : function(num)
    {
      // handle special cases
      switch (num) {
        case Infinity:
          return "Infinity";

        case -Infinity:
          return "-Infinity";

        case NaN:
          return "NaN";
      }

      var negative = (num < 0);

      if (negative) {
        num = -num;
      }

      if (this.getMaximumFractionDigits() != null)
      {
        // Do the rounding
        var mover = Math.pow(10, this.getMaximumFractionDigits());
        num = Math.round(num * mover) / mover;
      }

      var integerDigits = String(Math.floor(num)).length;

      var numStr = "" + num;

      // Prepare the integer part
      var integerStr = numStr.substring(0, integerDigits);

      while (integerStr.length < this.getMinimumIntegerDigits()) {
        integerStr = "0" + integerStr;
      }

      if (this.getMaximumIntegerDigits() != null && integerStr.length > this.getMaximumIntegerDigits())
      {
        // NOTE: We cut off even though we did rounding before, because there
        //     may be rounding errors ("12.24000000000001" -> "12.24")
        integerStr = integerStr.substring(integerStr.length - this.getMaximumIntegerDigits());
      }

      // Prepare the fraction part
      var fractionStr = numStr.substring(integerDigits + 1);

      while (fractionStr.length < this.getMinimumFractionDigits()) {
        fractionStr += "0";
      }

      if (this.getMaximumFractionDigits() != null && fractionStr.length > this.getMaximumFractionDigits())
      {
        // We have already rounded -> Just cut off the rest
        fractionStr = fractionStr.substring(0, this.getMaximumFractionDigits());
      }

      // Add the thousand groupings
      if (this.getGroupingUsed())
      {
        var origIntegerStr = integerStr;
        integerStr = "";
        var groupPos;

        for (groupPos=origIntegerStr.length; groupPos>3; groupPos-=3) {
          integerStr = "" + qx.locale.Number.getGroupSeparator(this.__locale) + origIntegerStr.substring(groupPos - 3, groupPos) + integerStr;
        }

        integerStr = origIntegerStr.substring(0, groupPos) + integerStr;
      }

      // Workaround: prefix and postfix are null even their defaultValue is "" and
      //             allowNull is set to false?!?
      var prefix = this.getPrefix() ? this.getPrefix() : "";
      var postfix = this.getPostfix() ? this.getPostfix() : "";

      // Assemble the number
      var str = prefix + (negative ? "-" : "") + integerStr;

      if (fractionStr.length > 0) {
        str += "" + qx.locale.Number.getDecimalSeparator(this.__locale) + fractionStr;
      }

      str += postfix;

      return str;
    },


    /**
     * Parses a number.
     *
     * @param str {String} the string to parse.
     * @return {Double} the number.
     * @throws {Error} If the number string does not match the number format.
     */
    parse : function(str)
    {
      // use the escaped separators for regexp
      var groupSepEsc = qx.lang.String.escapeRegexpChars(qx.locale.Number.getGroupSeparator(this.__locale) + "");
      var decimalSepEsc = qx.lang.String.escapeRegexpChars(qx.locale.Number.getDecimalSeparator(this.__locale) + "");

      var regex = new RegExp(
        "^" +
        qx.lang.String.escapeRegexpChars(this.getPrefix()) +
        '([-+]){0,1}'+
        '([0-9]{1,3}(?:'+ groupSepEsc + '{0,1}[0-9]{3}){0,})' +
        '(' + decimalSepEsc + '\\d+){0,1}' +
        qx.lang.String.escapeRegexpChars(this.getPostfix()) +
        "$"
      );

      var hit = regex.exec(str);

      if (hit == null) {
        throw new Error("Number string '" + str + "' does not match the number format");
      }

      var negative = (hit[1] == "-");
      var integerStr = hit[2];
      var fractionStr = hit[3];

      // Remove the thousand groupings
      integerStr = integerStr.replace(new RegExp(groupSepEsc, "g"), "");

      var asStr = (negative ? "-" : "") + integerStr;

      if (fractionStr != null && fractionStr.length != 0)
      {
        // Remove the leading decimal separator from the fractions string
        fractionStr = fractionStr.replace(new RegExp(decimalSepEsc), "");
        asStr += "." + fractionStr;
      }

      return parseFloat(asStr);
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#cldr
*/

/**
 * Provides information about locale-dependent number formatting (like the decimal
 * separator).
 */

qx.Class.define("qx.locale.Number",
{
  statics :
  {
    /**
     * Get decimal separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} decimal separator.
     */
    getDecimalSeparator : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_number_decimal_separator", [], locale)
    },


    /**
     * Get thousand grouping separator for number formatting
     *
     * @param locale {String} optional locale to be used
     * @return {String} group separator.
     */
    getGroupSeparator : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_number_group_separator", [], locale)
    },


    /**
     * Get percent format string
     *
     * @param locale {String} optional locale to be used
     * @return {String} percent format string.
     */
    getPercentFormat : function(locale) {
      return qx.locale.Manager.getInstance().localize("cldr_number_percent_format", [], locale)
    }
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A formatter and parser for dates, see
 * http://www.unicode.org/reports/tr35/#Date_Format_Patterns
 *
 * Here is a quick overview of the format pattern keys:
 * <table>
 * <tr><th>Key &nbsp;<th>Description
 * <tr><td><code> G </code><td> era, e.g. "AD"
 * <tr><td><code> y </code><td> year
 * <tr><td><code> Y </code><td> week year
 * <tr><td><code> u </code><td> extended year [Not supported yet]
 * <tr><td><code> Q </code><td> quarter
 * <tr><td><code> q </code><td> stand-alone quarter
 * <tr><td><code> M </code><td> month
 * <tr><td><code> L </code><td> stand-alone month
 * <tr><td><code> I </code><td> chinese leap month [Not supported yet]
 * <tr><td><code> w </code><td> week of year
 * <tr><td><code> W </code><td> week of month
 * <tr><td><code> d </code><td> day of month
 * <tr><td><code> D </code><td> day of year
 * <tr><td><code> F </code><td> day of week in month [Not supported yet]
 * <tr><td><code> g </code><td> modified Julian day [Not supported yet]
 * <tr><td><code> E </code><td> day of week
 * <tr><td><code> e </code><td> local day of week
 * <tr><td><code> c </code><td> stand-alone local day of week
 * <tr><td><code> a </code><td> period of day (am or pm)
 * <tr><td><code> h </code><td> 12-hour hour
 * <tr><td><code> H </code><td> 24-hour hour
 * <tr><td><code> K </code><td> hour [0-11]
 * <tr><td><code> k </code><td> hour [1-24]
 * <tr><td><code> j </code><td> special symbol [Not supported yet]
 * <tr><td><code> m </code><td> minute
 * <tr><td><code> s </code><td> second
 * <tr><td><code> S </code><td> fractional second
 * <tr><td><code> A </code><td> millisecond in day [Not supported yet]
 * <tr><td><code> z </code><td> time zone, specific non-location format
 * <tr><td><code> Z </code><td> time zone, rfc822/gmt format
 * <tr><td><code> v </code><td> time zone, generic non-location format [Not supported yet]
 * <tr><td><code> V </code><td> time zone, like z except metazone abbreviations [Not supported yet]
 * </table>
 *
 * (This list is preliminary, not all format keys might be implemented). Most
 * keys support repetitions that influence the meaning of the format. Parts of the
 * format string that should not be interpreted as format keys have to be
 * single-quoted.
 *
 * The same format patterns will be used for both parsing and output formatting.
 */
qx.Class.define("qx.util.format.DateFormat",
{
  extend : qx.core.Object,
  implement : qx.util.format.IFormat,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param format {String|null} The format to use. If null, the locale's default
   * format is used.
   * @param locale {String?} optional locale to be used. In case this is not present, the {@link #locale} property of DateFormat
   * will be following the {@link qx.locale.Manager#locale} property of qx.locale.Manager
   */
  construct : function(format, locale)
  {
    this.base(arguments);

    if (!locale)
    {
      this.__locale = qx.locale.Manager.getInstance().getLocale();
      this.__bindingId = qx.locale.Manager.getInstance().bind("locale", this, "locale");
    }
    else
    {
      this.__locale = locale;
      this.setLocale(locale);
    }

    this.__initialLocale = this.__locale;

    if (format != null)
    {
      this.__format = format.toString();
      if(this.__format in qx.util.format.DateFormat.ISO_MASKS)
      {
        if(this.__format === 'isoUtcDateTime') {
          this.__UTC = true;
        }
        this.__format = qx.util.format.DateFormat.ISO_MASKS[this.__format];
      }
    } else
    {
      this.__format = qx.locale.Date.getDateFormat("long", this.__locale) + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss", this.__locale);
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The locale used in this DateFormat instance*/
    locale :
    {
      apply : "_applyLocale",
      nullable : true,
      check : "String"
    }
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns a <code>DateFomat</code> instance that uses the
     * format.
     *
     * @return {String} the date/time instance.
     */
    getDateTimeInstance : function()
    {
      var DateFormat = qx.util.format.DateFormat;

      var format = qx.locale.Date.getDateFormat("long") + " " + qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

      if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
        DateFormat._dateTimeInstance = new DateFormat();
      }

      return DateFormat._dateTimeInstance;
    },


    /**
     * Returns a <code>DateFomat</code> instance that uses the format.
     *
     * @return {String} the date instance.
     */
    getDateInstance : function()
    {
      var DateFormat = qx.util.format.DateFormat;

      var format = qx.locale.Date.getDateFormat("short") + "";

      if (DateFormat._dateInstance == null || DateFormat._dateInstance.__format != format) {
        DateFormat._dateInstance = new DateFormat(format);
      }

      return DateFormat._dateInstance;
    },


    /**
     * {Integer} The threshold until when a year should be assumed to belong to the
     * 21st century (e.g. 12 -> 2012). Years over this threshold but below 100 will be
     * assumed to belong to the 20th century (e.g. 88 -> 1988). Years over 100 will be
     * used unchanged (e.g. 1792 -> 1792).
     */
    ASSUME_YEAR_2000_THRESHOLD : 30,

    /** {String} The date format used for logging. */
    LOGGING_DATE_TIME__format : "yyyy-MM-dd HH:mm:ss",

    /** Special masks of patterns that are used frequently*/
    ISO_MASKS : {
      isoDate :        "yyyy-MM-dd",
      isoTime :        "HH:mm:ss",
      isoDateTime :    "yyyy-MM-dd'T'HH:mm:ss",
      isoUtcDateTime : "yyyy-MM-dd'T'HH:mm:ss'Z'"
    },

    /** {String} The am marker. */
    AM_MARKER : "am",

    /** {String} The pm marker. */
    PM_MARKER : "pm"

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __bindingId : null,
    __locale : null,
    __initialLocale : null,
    __format : null,
    __parseFeed : null,
    __parseRules : null,
    __formatTree : null,
    __UTC : null,

    /**
     * Fills a number with leading zeros ("25" -> "0025").
     *
     * @param number {Integer} the number to fill.
     * @param minSize {Integer} the minimum size the returned string should have.
     * @return {String} the filled number as string.
     */
    __fillNumber : function(number, minSize)
    {
      var str = "" + (number < 0 ? ((-1) * number) : number);

      while (str.length < minSize) {
        str = "0" + str;
      }

      return number < 0 ? "-" + str : str;
    },


    /**
     * Returns the day in year of a date.
     *
     * @param date {Date} the date.
     * @return {Integer} the day in year.
     */
    __getDayInYear : function(date)
    {
      var helpDate = new Date(date.getTime());
      var day = helpDate.getDate();

      while (helpDate.getMonth() != 0)
      {
        // Set the date to the last day of the previous month
        helpDate.setDate(-1);
        day += helpDate.getDate() + 1;
      }

      return day;
    },


    /**
     * Returns the thursday in the same week as the date.
     *
     * @param date {Date} the date to get the thursday of.
     * @return {Date} the thursday in the same week as the date.
     */
    __thursdayOfSameWeek : function(date) {
      return new Date(date.getTime() + (3 - ((date.getDay() + 6) % 7)) * 86400000);
    },


    /**
     * Returns the week in year of a date.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week in year.
     */
    __getWeekInYear : function(date)
    {
      // This algorithm gets the correct calendar week after ISO 8601.
      // This standard is used in almost all european countries.
      // TODO: In the US week in year is calculated different!
      // See http://www.merlyn.demon.co.uk/weekinfo.htm
      // The following algorithm comes from http://www.salesianer.de/util/kalwoch.html
      // Get the thursday of the week the date belongs to
      var thursdayDate = this.__thursdayOfSameWeek(date);

      // Get the year the thursday (and therefore the week) belongs to
      var weekYear = thursdayDate.getFullYear();

      // Get the thursday of the week january 4th belongs to
      // (which defines week 1 of a year)
      var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(weekYear, 0, 4));

      // Calculate the calendar week
      return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
    },

    /**
     * Returns the week in month of a date.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week in month.
     */
    __getWeekInMonth : function(date)
    {
      var thursdayDate = this.__thursdayOfSameWeek(date);
      var thursdayWeek1 = this.__thursdayOfSameWeek(new Date(date.getFullYear(), date.getMonth(), 4));
      return Math.floor(1.5 + (thursdayDate.getTime() - thursdayWeek1.getTime()) / 86400000 / 7);
    },

    /**
     * Returns the week year of a date. (that is the year of the week where this date happens to be)
     * For a week in the middle of the summer, the year is easily obtained, but for a week
     * when New Year's Eve takes place, the year of that week is ambigous.
     * The thursday day of that week is used to determine the year.
     *
     * @param date {Date} the date to get the week in year of.
     * @return {Integer} the week year.
     */
    __getWeekYear : function(date)
    {
      var thursdayDate = this.__thursdayOfSameWeek(date);
      return thursdayDate.getFullYear();
    },

    /**
     * Returns true if the year is a leap one.
     *
     * @param year {Integer} the year to check.
     * @return {Boolean} true if it is a leap year.
     */
    __isLeapYear : function(year)
    {
      var februaryDate = new Date(year,2,1);
      februaryDate.setDate(-1);
      return februaryDate.getDate() + 1 === 29;
    },

    /**
     * Returns a json object with month and day as keys.
     *
     * @param dayOfYear {Integer} the day of year.
     * @param year {Integer} the year to check.
     * @return {Object} a json object {month: M, day: D}.
     */
    __getMonthAndDayFromDayOfYear : function(dayOfYear,year)
    {
      var month = 0;
      var day = 0;
      // if we don't know the year, we take a non-leap year'
      if(!year) {
        year = 1971;
      }
      var dayCounter = 0;
      for(var i=1; i <= 12; i++)
      {
        var tempDate = new Date(year,i,1);
        tempDate.setDate(-1);
        var days = tempDate.getDate() + 1;
        dayCounter += days;
        if(dayCounter < dayOfYear)
        {
          month++;
          day += days;
        }
        else
        {
          day = dayOfYear - (dayCounter-days);
          break;
        }
      }

      return {month: month,day: day};
    },

    /**
     * Returns the year of a date when we know the week year
     *
     * @param weekYear {Integer} the week year.
     * @param month {Integer} the month
     * @param dayOfMonth {Integer} the day in month
     * @return {Integer} the year.
     */
    __getYearFromWeekYearAndMonth : function(weekYear, month, dayOfMonth)
    {
      var year;
      switch(month){
        case 11 :
          year = weekYear - 1;
          if (weekYear != this.__getWeekYear(new Date(year,month,dayOfMonth))) {
            year = weekYear;
          }
        break;
        case 0 :
          year = weekYear + 1;
          if (weekYear != this.__getWeekYear(new Date(year,month,dayOfMonth))) {
            year = weekYear;
          }
        break;
        default :
          year = weekYear;
      }
      return year;
    },

    /**
     * Applies the new value for locale property
     * @param value {String} The new value.
     * @param old {String} The old value.
     *
     */
    _applyLocale : function(value, old)
    {
      this.__locale = value === null ? this.setLocale(this.__initialLocale) : value;
    },

    /**
     * Formats a date.
     *
     * @param date {Date} The date to format.
     * @return {String} the formatted date.
     */
    format : function(date)
    {
      // check for null dates
      if (date == null) {
        return null;
      }

      if(isNaN(date.getTime())) {
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.error("Provided date is invalid");
        }
        return null;
      }

      if(this.__UTC) {
        date = new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds());
      }

      var locale = this.__locale;

      var fullYear = date.getFullYear();
      var month = date.getMonth();
      var dayOfMonth = date.getDate();
      var dayOfWeek = date.getDay();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();
      var ms = date.getMilliseconds();

      var timezoneOffset = date.getTimezoneOffset();
      var timezoneSign = timezoneOffset > 0 ? 1 : -1;
      var timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
      var timezoneMinutes = Math.abs(timezoneOffset) % 60;

      // Create the output
      this.__initFormatTree();
      var output = "";

      for (var i=0; i<this.__formatTree.length; i++)
      {
        var currAtom = this.__formatTree[i];

        if (currAtom.type == "literal") {
          output += currAtom.text;
        }
        else
        {
          // This is a wildcard
          var wildcardChar = currAtom.character;
          var wildcardSize = currAtom.size;

          // Get its replacement
          var replacement = "?";

          switch(wildcardChar)
          {
              // TODO: F - Day of week in month (e.g.   2). Problem: What is this?
            case 'y': // Year
              if (wildcardSize == 2) {
                replacement = this.__fillNumber(fullYear % 100, 2);
              } else {
                var year = Math.abs(fullYear);
                replacement = year + "";
                if (wildcardSize > replacement.length) {
                  for (var j = replacement.length; j < wildcardSize; j++) {
                    replacement = "0" + replacement;
                  };
                }
                if(fullYear < 0) {
                  replacement = "-" + replacement;
                }
              }

              break;

            case 'Y': // Year
              replacement = this.__getWeekYear(date) + "";
              var year = replacement.replace('-','');
              if (wildcardSize > replacement.length) {
                for (var j = year.length; j < wildcardSize; j++) {
                  year = "0" + year;
                };
              }
              replacement = replacement.indexOf("-") != -1 ? "-" + year : year;

              break;

            case 'G': // Era - there is no CLDR data for ERA yet
              if (wildcardSize >= 1 && wildcardSize <= 3) {
                replacement = fullYear > 0 ? 'AD' : 'BC';
              }
              else if(wildcardSize == 4) {
                replacement = fullYear > 0 ? 'Anno Domini' : 'Before Christ';
              }
              else if(wildcardSize == 5) {
                replacement = fullYear > 0 ? 'A' : 'B';
              }

              break;

            case 'Q': // quarter
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(parseInt(month/4) + 1, wildcardSize);
              }
              if(wildcardSize == 3) {
                replacement = 'Q' + (parseInt(month/4) + 1);
              }

              break;

            case 'q': // quarter stand alone
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(parseInt(month/4) + 1, wildcardSize);
              }
              if(wildcardSize == 3) {
                replacement = 'Q' + (parseInt(month/4) + 1);
              }

              break;

            case 'D': // Day in year (e.g. 189)
              replacement = this.__fillNumber(this.__getDayInYear(date), wildcardSize);
              break;

            case 'd': // Day in month
              replacement = this.__fillNumber(dayOfMonth, wildcardSize);
              break;

            case 'w': // Week in year (e.g. 27)
              replacement = this.__fillNumber(this.__getWeekInYear(date), wildcardSize);
              break;

            case 'W': // Week in year (e.g. 27)
              replacement = this.__getWeekInMonth(date);
              break;

            case 'E': // Day in week
              if (wildcardSize >= 1 && wildcardSize <= 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
              }

              break;

            case 'e': // Day in week
              var startOfWeek = qx.locale.Date.getWeekStart(locale);
              // the index is 1 based
              var localeDayOfWeek = 1 + ((dayOfWeek - startOfWeek >=0) ? (dayOfWeek - startOfWeek) : 7 + (dayOfWeek-startOfWeek));
              if (wildcardSize >= 1 && wildcardSize <= 2) {
                replacement = this.__fillNumber(localeDayOfWeek, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "format", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "format", true);
              }

              break;

            case 'c': // Stand-alone local day in week
              var startOfWeek = qx.locale.Date.getWeekStart(locale);
              // the index is 1 based
              var localeDayOfWeek = 1 + ((dayOfWeek - startOfWeek >=0) ? (dayOfWeek - startOfWeek) : 7 + (dayOfWeek-startOfWeek));
              if (wildcardSize == 1) {
                replacement = ''+localeDayOfWeek;
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getDayName("abbreviated", dayOfWeek, locale, "stand-alone", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getDayName("wide", dayOfWeek, locale, "stand-alone", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getDayName("narrow", dayOfWeek, locale, "stand-alone", true);
              }

              break;

            case 'M': // Month
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(month + 1, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "format", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getMonthName("wide", month, locale, "format", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getMonthName("narrow", month, locale, "format", true);

              }

              break;

            case 'L': // Stand-alone month
              if (wildcardSize == 1 || wildcardSize == 2) {
                replacement = this.__fillNumber(month + 1, wildcardSize);
              } else if (wildcardSize == 3) {
                replacement = qx.locale.Date.getMonthName("abbreviated", month, locale, "stand-alone", true);
              } else if (wildcardSize == 4) {
                replacement = qx.locale.Date.getMonthName("wide", month, locale, "stand-alone", true);
              } else if (wildcardSize == 5) {
                replacement = qx.locale.Date.getMonthName("narrow", month, locale, "stand-alone", true);
              }

              break;

            case 'a': // am/pm marker
              // NOTE: 0:00 is am, 12:00 is pm
              replacement = (hours < 12) ? qx.locale.Date.getAmMarker(locale) : qx.locale.Date.getPmMarker(locale);
              break;

            case 'H': // Hour in day (0-23)
              replacement = this.__fillNumber(hours, wildcardSize);
              break;

            case 'k': // Hour in day (1-24)
              replacement = this.__fillNumber((hours == 0) ? 24 : hours, wildcardSize);
              break;

            case 'K': // Hour in am/pm (0-11)
              replacement = this.__fillNumber(hours % 12, wildcardSize);
              break;

            case 'h': // Hour in am/pm (1-12)
              replacement = this.__fillNumber(((hours % 12) == 0) ? 12 : (hours % 12), wildcardSize);
              break;

            case 'm': // Minute in hour
              replacement = this.__fillNumber(minutes, wildcardSize);
              break;

            case 's': // Second in minute
              replacement = this.__fillNumber(seconds, wildcardSize);
              break;

            case 'S': // Fractional second
              replacement = this.__fillNumber(ms, 3);
              if (wildcardSize < replacement.length) {
                replacement = replacement.substr(0, wildcardSize);
              } else {
                while (wildcardSize > replacement.length) {
                  // if needed, fill the remaining wildcard length with trailing zeros
                  replacement += "0";
                }
              }
              break;

            case 'z': // Time zone
              if (wildcardSize >= 1 && wildcardSize <= 4)
              {
                replacement =
                "GMT" +
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                ":" + this.__fillNumber(timezoneMinutes, 2);
              }

              break;

            case 'Z': // RFC 822 time zone
              if (wildcardSize >= 1 && wildcardSize <= 3)
              {
              replacement =
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                this.__fillNumber(timezoneMinutes, 2);
              }
              else
              {
                replacement =
                "GMT" +
                ((timezoneSign > 0) ? "-" : "+") +
                this.__fillNumber(Math.abs(timezoneHours), 2) +
                ":" + this.__fillNumber(timezoneMinutes, 2);
              }
              break;
          }

          output += replacement;
        }
      }

      return output;
    },


    /**
     * Parses a date.
     *
     * @param dateStr {String} the date to parse.
     * @return {Date} the parsed date.
     * @throws {Error} If the format is not well formed or if the date string does not
     *       match to the format.
     */
    parse : function(dateStr)
    {
      this.__initParseFeed();

      // Apply the regex
      var hit = this.__parseFeed.regex.exec(dateStr);

      if (hit == null) {
        throw new Error("Date string '" + dateStr + "' does not match the date format: " + this.__format);
      }

      // Apply the rules
      var dateValues =
      {
        era         : 1,
        year        : 1970,
        quarter     : 1,
        month       : 0,
        day         : 1,
        dayOfYear   : 1,
        hour        : 0,
        ispm        : false,
        weekDay     : 4,
        weekYear    : 1970,
        weekOfMonth : 1,
        weekOfYear  : 1,
        min         : 0,
        sec         : 0,
        ms          : 0
      };

      var currGroup = 1;
      var applyWeekYearAfterRule = false;
      var applyDayOfYearAfterRule = false;

      for (var i=0; i<this.__parseFeed.usedRules.length; i++)
      {
        var rule = this.__parseFeed.usedRules[i];

        var value = hit[currGroup];

        if (rule.field != null) {
          dateValues[rule.field] = parseInt(value, 10);
        } else {
          rule.manipulator(dateValues, value, rule.pattern);
        }

        if(rule.pattern == "Y+")
        {
          var yearRuleApplied = false;
          for(var k=0; k<this.__parseFeed.usedRules.length; k++) {
            if(this.__parseFeed.usedRules[k].pattern == 'y+'){
              yearRuleApplied = true;
              break;
            }
          }
          if(!yearRuleApplied) {
            applyWeekYearAfterRule = true;
          }
        }

        if(rule.pattern.indexOf("D") != -1)
        {
          var dayRuleApplied = false;
          for(var k=0; k<this.__parseFeed.usedRules.length; k++) {
            if(this.__parseFeed.usedRules[k].pattern.indexOf("d") != -1){
              dayRuleApplied = true;
              break;
            }
          }
          if(!dayRuleApplied) {
            applyDayOfYearAfterRule = true;
          }
        }

        currGroup += (rule.groups == null) ? 1 : rule.groups;
      }
      if(applyWeekYearAfterRule) {
        dateValues.year = this.__getYearFromWeekYearAndMonth(dateValues.weekYear,dateValues.month,dateValues.day);
      }

      if(applyDayOfYearAfterRule)
      {
        var dayAndMonth = this.__getMonthAndDayFromDayOfYear(dateValues.dayOfYear, dateValues.year);
        dateValues.month = dayAndMonth.month;
        dateValues.day = dayAndMonth.day;
      }

      if(dateValues.era < 0 && (dateValues.year * dateValues.era < 0)) {
        dateValues.year = dateValues.year * dateValues.era;
      }

      var date = new Date(dateValues.year, dateValues.month, dateValues.day, (dateValues.ispm) ? (dateValues.hour + 12) : dateValues.hour, dateValues.min, dateValues.sec, dateValues.ms);

      if(this.__UTC) {
        date = new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds(),date.getUTCMilliseconds());
      }

      if (dateValues.month != date.getMonth() || dateValues.year != date.getFullYear())
      {
        // TODO: check if this is also necessary for the time components
        throw new Error("Error parsing date '" + dateStr + "': the value for day or month is too large");
      }

      return date;
    },


    /**
     * Helper method for {@link #format()} and {@link #parse()}.
     * Parses the date format.
     *
     * @return {void}
     */
    __initFormatTree : function()
    {
      if (this.__formatTree != null) {
        return;
      }

      this.__formatTree = [];

      var currWildcardChar;
      var currWildcardSize = 0;
      var currLiteral = "";
      var format = this.__format;

      var state = "default";

      var i = 0;

      while (i < format.length)
      {
        var currChar = format.charAt(i);

        switch(state)
        {
          case "quoted_literal":
            // We are now inside a quoted literal
            // Check whether the current character is an escaped "'" character
            if (currChar == "'")
            {
              if (i + 1 >= format.length)
              {

                // this is the last character
                i++;

                break;
              }

              var lookAhead = format.charAt(i + 1);

              if (lookAhead == "'")
              {
                currLiteral += currChar;
                i++;
              }
              else
              {

                // quoted literal ends
                i++;

                state = "unkown";
              }
            }
            else
            {
              currLiteral += currChar;
              i++;
            }

            break;

          case "wildcard":
            // Check whether the currChar belongs to that wildcard
            if (currChar == currWildcardChar)
            {
              // It does -> Raise the size
              currWildcardSize++;

              i++;
            }
            else
            {
              // It does not -> The current wildcard is done
              this.__formatTree.push(
              {
                type      : "wildcard",
                character : currWildcardChar,
                size      : currWildcardSize
              });

              currWildcardChar = null;
              currWildcardSize = 0;
              state = "default";
            }

            break;

          default:
            // We are not (any more) in a wildcard or quoted literal -> Check what's starting here
            if ((currChar >= 'a' && currChar <= 'z') || (currChar >= 'A' && currChar <= 'Z'))
            {
              // This is a letter -> All letters are wildcards
              // Start a new wildcard
              currWildcardChar = currChar;
              state = "wildcard";
            }
            else if (currChar == "'")
            {
              if (i + 1 >= format.length)
              {
                // this is the last character
                currLiteral += currChar;
                i++;
                break;
              }

              var lookAhead = format.charAt(i + 1);

              if (lookAhead == "'")
              {
                currLiteral += currChar;
                i++;
              }

              i++;
              state = "quoted_literal";
            }
            else
            {
              state = "default";
            }

            if (state != "default")
            {
              // Add the literal
              if (currLiteral.length > 0)
              {
                this.__formatTree.push(
                {
                  type : "literal",
                  text : currLiteral
                });

                currLiteral = "";
              }
            }
            else
            {
              // This is an unquoted literal -> Add it to the current literal
              currLiteral += currChar;
              i++;
            }

            break;
        }
      }

      // Add the last wildcard or literal
      if (currWildcardChar != null)
      {
        this.__formatTree.push(
        {
          type      : "wildcard",
          character : currWildcardChar,
          size      : currWildcardSize
        });
      }
      else if (currLiteral.length > 0)
      {
        this.__formatTree.push(
        {
          type : "literal",
          text : currLiteral
        });
      }
    },


    /**
     * Initializes the parse feed.
     *
     * The parse contains everything needed for parsing: The regular expression
     * (in compiled and uncompiled form) and the used rules.
     *
     * @return {Map} the parse feed.
     * @throws {Error} If the date format is malformed.
     */
    __initParseFeed : function()
    {
      if (this.__parseFeed != null)
      {
        // We already have the parse feed
        return ;
      }

      var format = this.__format;

      // Initialize the rules
      this.__initParseRules();
      this.__initFormatTree();

      // Get the used rules and construct the regex pattern
      var usedRules = [];
      var pattern = "^";

      for (var atomIdx=0; atomIdx<this.__formatTree.length; atomIdx++)
      {
        var currAtom = this.__formatTree[atomIdx];

        if (currAtom.type == "literal") {
          pattern += qx.lang.String.escapeRegexpChars(currAtom.text);
        }
        else
        {
          // This is a wildcard
          var wildcardChar = currAtom.character;
          var wildcardSize = currAtom.size;

          // Get the rule for this wildcard
          var wildcardRule;

          for (var ruleIdx=0; ruleIdx<this.__parseRules.length; ruleIdx++)
          {
            var rule = this.__parseRules[ruleIdx];

            if ( this.__isRuleForWildcard(rule,wildcardChar,wildcardSize))
            {
              // We found the right rule for the wildcard
              wildcardRule = rule;
              break;
            }
          }

          // Check the rule
          if (wildcardRule == null)
          {
            // We have no rule for that wildcard -> Malformed date format
            var wildcardStr = "";

            for (var i=0; i<wildcardSize; i++) {
              wildcardStr += wildcardChar;
            }

            throw new Error("Malformed date format: " + format + ". Wildcard " + wildcardStr + " is not supported");
          }
          else
          {
            // Add the rule to the pattern
            usedRules.push(wildcardRule);
            pattern += wildcardRule.regex;
          }
        }
      }

      pattern += "$";

      // Create the regex
      var regex;

      try {
        regex = new RegExp(pattern);
      } catch(exc) {
        throw new Error("Malformed date format: " + format);
      }

      // Create the this.__parseFeed
      this.__parseFeed =
      {
        regex       : regex,
        "usedRules" : usedRules,
        pattern     : pattern
      };
    },

    /**
     * Checks wether the rule matches the wildcard or not.
     * @param rule {Object} the rule we try to match with the wildcard
     * @param wildcardChar {String} the character in the wildcard
     * @param wildcardSize {Integer} the number of  wildcardChar characters in the wildcard
     * @return {Boolean} if the rule matches or not
     */
    __isRuleForWildcard : function(rule, wildcardChar, wildcardSize)
    {
      if(wildcardChar==='y' && rule.pattern==='y+')
      {
        rule.regex = rule.regexFunc(wildcardSize);
        return true;
      }
      else if(wildcardChar==='Y' && rule.pattern==='Y+')
      {
        rule.regex = rule.regexFunc(wildcardSize);
        return true;
      }
      else
      {
        return wildcardChar == rule.pattern.charAt(0) && wildcardSize == rule.pattern.length;
      }
    },
    /**
     * Initializes the static parse rules.
     *
     * @return {void}
     */
    __initParseRules : function()
    {
      var DateFormat = qx.util.format.DateFormat;
      var LString = qx.lang.String;

      if (this.__parseRules != null)
      {
        // The parse rules are already initialized
        return ;
      }

      var rules = this.__parseRules = [];

      var amMarker = qx.locale.Date.getAmMarker(this.__locale).toString() || DateFormat.AM_MARKER;
      var pmMarker = qx.locale.Date.getPmMarker(this.__locale).toString() || DateFormat.PM_MARKER;
      var locale = this.__locale;

      var yearManipulator = function(dateValues, value)
      {
        value = parseInt(value, 10);

        if(value > 0)
        {
          if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
            value += 2000;
          } else if (value < 100) {
            value += 1900;
          }
        }

        dateValues.year = value;
      };

      var weekYearManipulator = function(dateValues, value)
      {
        value = parseInt(value, 10);

        if(value > 0)
        {
          if (value < DateFormat.ASSUME_YEAR_2000_THRESHOLD) {
            value += 2000;
          } else if (value < 100) {
            value += 1900;
          }
        }

        dateValues.weekYear = value;
      };

      var monthManipulator = function(dateValues, value) {
        dateValues.month = parseInt(value, 10) - 1;
      };

      var localWeekDayManipulator = function(dateValues, value) {
        var startOfWeek = qx.locale.Date.getWeekStart(locale);
        var dayOfWeek =  (parseInt(value,10) - 1 + startOfWeek) <= 6 ? parseInt(value,10) - 1 + startOfWeek : (parseInt(value,10) - 1 + startOfWeek) -7;
        dateValues.weekDay = dayOfWeek;
      }

      var ampmManipulator = function(dateValues, value) {
        var pmMarker = qx.locale.Date.getPmMarker(locale).toString() || DateFormat.PM_MARKER;
        dateValues.ispm = (value == pmMarker);
      };

      var noZeroHourManipulator = function(dateValues, value) {
        dateValues.hour = parseInt(value, 10) % 24;
      };

      var noZeroAmPmHourManipulator = function(dateValues, value) {
        dateValues.hour = parseInt(value, 10) % 12;
      };

      var ignoreManipulator = function(dateValues, value) {
        return;
      };

      var narrowEraNames = ['A', 'B'];
      var narrowEraNameManipulator = function(dateValues, value) {
        dateValues.era = value == 'A' ? 1 : -1;
      }

      var abbrevEraNames = ['AD', 'BC'];
      var abbrevEraNameManipulator = function(dateValues, value) {
        dateValues.era = value == 'AD' ? 1 : -1;
      }

      var fullEraNames = ['Anno Domini', 'Before Christ'];
      var fullEraNameManipulator = function(dateValues, value) {
        dateValues.era = value == 'Anno Domini' ? 1 : -1;
      }

      var abbrevQuarterNames = ['Q1','Q2','Q3','Q4'];
      var abbrevQuarterManipulator = function(dateValues, value) {
        dateValues.quarter = abbrevQuarterNames.indexOf(value);
      }

      var fullQuarterNames = ['1st quarter','2nd quarter','3rd quarter','4th quarter'];
      var fullQuarterManipulator = function(dateValues, value) {
        dateValues.quarter = fullQuarterNames.indexOf(value);
      }

      var cache = {};

      var dateNamesManipulator = function(pattern){
        var monthPatternLetters = ['L','M'];
        var dayPatternLetters = ['c', 'e', 'E'];
        var firstLetterInPattern = pattern.charAt(0);
        var isMonth = monthPatternLetters.indexOf(firstLetterInPattern)>=0;

        var getContext = function() {
          var letters = isMonth ? monthPatternLetters : dayPatternLetters;
          var context = firstLetterInPattern === letters[0] ? "stand-alone" : "format" ;
          var patternLength = pattern.length;
          var lengthName = 'abbreviated';
          switch(patternLength)
          {
            case 4:
              lengthName = 'wide';
              break;
            case 5:
              lengthName = 'narrow';
              break;
            default:
              lengthName = 'abbreviated';
          }
          return [context, lengthName];
        }

        if(!cache[pattern])
        {
          cache[pattern] = {};
          var context = getContext();
          var func = isMonth ? qx.locale.Date.getMonthNames : qx.locale.Date.getDayNames;
          var names = func.call(qx.locale.Date, context[1], locale, context[0], true);
          for(var i=0, l=names.length; i<l; i++)
          {
            names[i] = LString.escapeRegexpChars(names[i].toString());
          }
          cache[pattern].data = names;
          cache[pattern].func = function(dateValues, value)
          {
            value = LString.escapeRegexpChars(value);
            dateValues[isMonth ? 'month' : 'weekDay'] = names.indexOf(value);
          }
        }

        return cache[pattern];
      }

      // Unsupported: F (Day of week in month)

      rules.push(
      {
        pattern     : "y+",
        regexFunc       : function(yNumber)
          {
            var regex = "(-*";
            for(var i=0;i<yNumber;i++)
            {
              regex += "\\d";
              if(i===yNumber-1 && i!==1) {
                regex += "+?";
              }
            }
            regex += ")";
            return regex;
          },
        manipulator : yearManipulator
      });

      rules.push(
      {
        pattern     : "Y+",
        regexFunc       : function(yNumber)
          {
            var regex = "(-*";
            for(var i=0;i<yNumber;i++)
            {
              regex += "\\d";
              if(i===yNumber-1) {
                regex += "+?";
              }
            }
            regex += ")";
            return regex;
          },
        manipulator : weekYearManipulator
      });

      rules.push(
      {
        pattern     : "G",
        regex       : "(" + abbrevEraNames.join("|") + ")",
        manipulator : abbrevEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GG",
        regex       : "(" + abbrevEraNames.join("|") + ")",
        manipulator : abbrevEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GGG",
        regex       : "(" + abbrevEraNames.join("|") + ")",
        manipulator : abbrevEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GGGG",
        regex       : "(" + fullEraNames.join("|") + ")",
        manipulator : fullEraNameManipulator
      });

      rules.push(
      {
        pattern     : "GGGGG",
        regex       : "(" + narrowEraNames.join("|") + ")",
        manipulator : narrowEraNameManipulator
      });

      rules.push(
      {
        pattern     : "Q",
        regex       : "(\\d\\d*?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "QQ",
        regex       : "(\\d\\d?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "QQQ",
        regex       : "(" + abbrevQuarterNames.join("|") + ")",
        manipulator : abbrevQuarterManipulator
      });

      rules.push(
      {
        pattern     : "QQQQ",
        regex       : "(" + fullQuarterNames.join("|") + ")",
        manipulator : fullQuarterManipulator
      });

      rules.push(
      {
        pattern     : "q",
        regex       : "(\\d\\d*?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "qq",
        regex       : "(\\d\\d?)",
        field : "quarter"
      });

      rules.push(
      {
        pattern     : "qqq",
        regex       : "(" + abbrevQuarterNames.join("|") + ")",
        manipulator : abbrevQuarterManipulator
      });

      rules.push(
      {
        pattern     : "qqqq",
        regex       : "(" + fullQuarterNames.join("|") + ")",
        manipulator : fullQuarterManipulator
      });

      rules.push(
      {
        pattern     : "M",
        regex       : "(\\d\\d*?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "MM",
        regex       : "(\\d\\d?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "MMM",
        regex       : "(" + dateNamesManipulator("MMM").data.join("|") + ")",
        manipulator : dateNamesManipulator("MMM").func
      });

      rules.push(
      {
        pattern     : "MMMM",
        regex       : "(" + dateNamesManipulator("MMMM").data.join("|") + ")",
        manipulator : dateNamesManipulator("MMMM").func
      });

      rules.push(
      {
        pattern     : "MMMMM",
        regex       : "(" + dateNamesManipulator("MMMMM").data.join("|") + ")",
        manipulator : dateNamesManipulator("MMMMM").func
      });

      rules.push(
      {
        pattern     : "L",
        regex       : "(\\d\\d*?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "LL",
        regex       : "(\\d\\d?)",
        manipulator : monthManipulator
      });

      rules.push(
      {
        pattern     : "LLL",
        regex       : "(" + dateNamesManipulator("LLL").data.join("|") + ")",
        manipulator : dateNamesManipulator("LLL").func
      });

      rules.push(
      {
        pattern     : "LLLL",
        regex       : "(" + dateNamesManipulator("LLLL").data.join("|") + ")",
        manipulator : dateNamesManipulator("LLLL").func
      });

      rules.push(
      {
        pattern     : "LLLLL",
        regex       : "(" + dateNamesManipulator("LLLLL").data.join("|") + ")",
        manipulator : dateNamesManipulator("LLLLL").func
      });

      rules.push(
      {
        pattern : "dd",
        regex   : "(\\d\\d?)",
        field   : "day"
      });

      rules.push(
      {
        pattern : "d",
        regex   : "(\\d\\d*?)",
        field   : "day"
      });

      rules.push(
      {
        pattern : "D",
        regex   : "(\\d?)",
        field   : "dayOfYear"
      });

      rules.push(
      {
        pattern : "DD",
        regex   : "(\\d\\d?)",
        field   : "dayOfYear"
      });

      rules.push(
      {
        pattern : "DDD",
        regex   : "(\\d\\d\\d?)",
        field   : "dayOfYear"
      });

      rules.push(
      {
        pattern     : "E",
        regex       : "(" + dateNamesManipulator("E").data.join("|") + ")",
        manipulator : dateNamesManipulator("E").func
      });

      rules.push(
      {
        pattern     : "EE",
        regex       : "(" + dateNamesManipulator("EE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EE").func
      });

      rules.push(
      {
        pattern     : "EEE",
        regex       : "(" + dateNamesManipulator("EEE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EEE").func
      });

      rules.push(
      {
        pattern     : "EEEE",
        regex       : "(" + dateNamesManipulator("EEEE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EEEE").func
      });

      rules.push(
      {
        pattern     : "EEEEE",
        regex       : "(" + dateNamesManipulator("EEEEE").data.join("|") + ")",
        manipulator : dateNamesManipulator("EEEEE").func
      });

      rules.push(
      {
        pattern     : "e",
        regex       : "(\\d?)",
        manipulator : localWeekDayManipulator
      });

      rules.push(
      {
        pattern     : "ee",
        regex       : "(\\d\\d?)",
        manipulator : localWeekDayManipulator
      });

      rules.push(
      {
        pattern     : "eee",
        regex       : "(" + dateNamesManipulator("eee").data.join("|") + ")",
        manipulator : dateNamesManipulator("eee").func
      });

      rules.push(
      {
        pattern     : "eeee",
        regex       : "(" + dateNamesManipulator("eeee").data.join("|") + ")",
        manipulator : dateNamesManipulator("eeee").func
      });

      rules.push(
      {
        pattern     : "eeeee",
        regex       : "(" + dateNamesManipulator("eeeee").data.join("|") + ")",
        manipulator : dateNamesManipulator("eeeee").func
      });

      rules.push(
      {
        pattern     : "c",
        regex       : "\\d?",
        manipulator : localWeekDayManipulator
      });

      rules.push(
      {
        pattern     : "ccc",
        regex       : "(" + dateNamesManipulator("ccc").data.join("|") + ")",
        manipulator : dateNamesManipulator("ccc").func
      });

      rules.push(
      {
        pattern     : "cccc",
        regex       : "(" + dateNamesManipulator("cccc").data.join("|") + ")",
        manipulator : dateNamesManipulator("cccc").func
      });

      rules.push(
      {
        pattern     : "ccccc",
        regex       : "(" + dateNamesManipulator("ccccc").data.join("|") + ")",
        manipulator : dateNamesManipulator("ccccc").func
      });

      rules.push(
      {
        pattern     : "a",
        regex       : "(" + amMarker + "|" + pmMarker + ")",
        manipulator : ampmManipulator
      });

      rules.push(
      {
        pattern : "W",
        regex   : "(\\d?)",
        field   : "weekOfMonth"
      });

      rules.push(
      {
        pattern : "w",
        regex   : "(\\d?)",
        field   : "weekOfYear"
      });

      rules.push(
      {
        pattern : "ww",
        regex   : "(\\d\\d?)",
        field   : "weekOfYear"
      });

      rules.push(
      {
        pattern : "HH",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern : "H",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern     : "kk",
        regex       : "(\\d\\d?)",
        manipulator : noZeroHourManipulator
      });

      rules.push(
      {
        pattern     : "k",
        regex       : "(\\d\\d?)",
        manipulator : noZeroHourManipulator
      });

      rules.push(
      {
        pattern : "KK",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern : "K",
        regex   : "(\\d\\d?)",
        field   : "hour"
      });

      rules.push(
      {
        pattern     : "hh",
        regex       : "(\\d\\d?)",
        manipulator : noZeroAmPmHourManipulator
      });

      rules.push(
      {
        pattern     : "h",
        regex       : "(\\d\\d?)",
        manipulator : noZeroAmPmHourManipulator
      });

      rules.push(
      {
        pattern : "mm",
        regex   : "(\\d\\d?)",
        field   : "min"
      });

      rules.push(
      {
        pattern : "m",
        regex   : "(\\d\\d?)",
        field   : "min"
      });

      rules.push(
      {
        pattern : "ss",
        regex   : "(\\d\\d?)",
        field   : "sec"
      });

      rules.push(
      {
        pattern : "s",
        regex   : "(\\d\\d?)",
        field   : "sec"
      });

      rules.push(
      {
        pattern : "SSS",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern : "SS",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern : "S",
        regex   : "(\\d\\d?\\d?)",
        field   : "ms"
      });

      rules.push(
      {
        pattern     : "Z",
        regex       : "([\\+\\-]\\d\\d\\d\\d)",
        manipulator : ignoreManipulator
      });

      rules.push(
      {
        pattern     : "z",
        regex       : "(GMT[\\+\\-]\\d\\d:\\d\\d)",
        manipulator : ignoreManipulator
      });
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__bindingId != null) {
      qx.locale.Manager.getInstance().removeBinding(this.__bindingId);
    }
    this.__formatTree = this.__parseFeed = this.__parseRules = null;
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#cldr
*/

/**
 * Static class that provides localized date information (like names of week
 * days, AM/PM markers, start of week, etc.).
 */
qx.Class.define("qx.locale.Date",
{
  statics :
  {
    /**
     * Reference to the locale manager.
     *
     * @internal
     */
    __mgr : qx.locale.Manager.getInstance(),


    /**
     * Get AM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated AM marker.
     */
    getAmMarker : function(locale) {
      return this.__mgr.localize("cldr_am", [], locale);
    },


    /**
     * Get PM marker for time definitions
     *
     * @param locale {String} optional locale to be used
     * @return {String} translated PM marker.
     */
    getPmMarker : function(locale) {
      return this.__mgr.localize("cldr_pm", [], locale);
    },


    /**
     * Return localized names of day names
     *
     * @param length {String} format of the day names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the day
     * @return {String[]} array of localized day names starting with sunday.
     */
    getDayNames : function(length, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var days = [ "sun", "mon", "tue", "wed", "thu", "fri", "sat" ];

      var names = [];

      for (var i=0; i<days.length; i++)
      {
        var key = "cldr_day_" + context + "_" + length + "_" + days[i];
        names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
      }

      return names;
    },


    /**
     * Return localized name of a week day name
     *
     * @param length {String} format of the day name.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param day {Integer} day number. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the day
     * @return {String} localized day name
     */
    getDayName : function(length, day, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInteger(day);
        qx.core.Assert.assertInRange(day, 0, 6);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var days = [ "sun", "mon", "tue", "wed", "thu", "fri", "sat" ];

      var key = "cldr_day_" + context + "_" + length + "_" + days[day];
      return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
    },


    /**
     * Return localized names of month names
     *
     * @param length {String} format of the month names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the month
     * @return {String[]} array of localized month names starting with january.
     */
    getMonthNames : function(length, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var names = [];

      for (var i=0; i<12; i++)
      {
        var key = "cldr_month_" + context + "_" + length + "_" + (i + 1);
        names.push(withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale));
      }

      return names;
    },


    /**
     * Return localized name of a month
     *
     * @param length {String} format of the month names.
     *       Possible values: "abbreviated", "narrow", "wide"
     * @param month {Integer} index of the month. 0=january, 1=february, ...
     * @param locale {String} optional locale to be used
     * @param context {String} (default: "format") intended context.
     *       Possible values: "format", "stand-alone"
     * @param withFallback {Boolean?} if true, the previous parameter's other value is tried
     * in order to find a localized name for the month
     * @return {String} localized month name
     */
    getMonthName : function(length, month, locale, context, withFallback)
    {
      var context = context ? context : "format";

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(length, ["abbreviated", "narrow", "wide"]);
        qx.core.Assert.assertInArray(context, ["format", "stand-alone"]);
      }

      var key = "cldr_month_" + context + "_" + length + "_" + (month + 1);
      return withFallback ? this.__localizeWithFallback(context, context === 'format' ? 'stand-alone' : 'format', key, locale) : this.__mgr.localize(key, [], locale);
    },


    /**
     * Return localized date format string to be used with {@link qx.util.format.DateFormat}.
     *
     * @param size {String} format of the date format.
     *      Possible values: "short", "medium", "long", "full"
     * @param locale {String} optional locale to be used
     * @return {String} localized date format string
     */
    getDateFormat : function(size, locale)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
      }

      var key = "cldr_date_format_" + size;
      return this.__mgr.localize(key, [], locale)
    },


    /**
     * Try to localize a date/time format string.
     *
     * If no localization is available take the fallback format string
     *
     * @param canonical {String} format string containing only field information, and in a canonical order.
     *       Examples are "yyyyMMMM" for year + full month, or "MMMd" for abbreviated month + day.
     * @param fallback {String} fallback format string if no localized version is found
     * @param locale {String} optional locale to be used
     * @return {String} best matching format string
     */
    getDateTimeFormat : function(canonical, fallback, locale)
    {
      var key = "cldr_date_time_format_" + canonical;
      var localizedFormat = this.__mgr.localize(key, [], locale);

      if (localizedFormat == key) {
        localizedFormat = fallback;
      }

      return localizedFormat;
    },


    /**
     * Return localized time format string to be used with {@link qx.util.format.DateFormat}.
     *
     * @param size {String} format of the time pattern.
     *      Possible values: "short", "medium", "long", "full"
     * @param locale {String} optional locale to be used
     * @return {String} localized time format string
     */
    getTimeFormat : function(size, locale)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertInArray(size, ["short", "medium", "long", "full"]);
      }

      var key = "cldr_time_format_" + size;
      var localizedFormat = this.__mgr.localize(key, [], locale);

      if (localizedFormat != key) {
        return localizedFormat;
      }

      switch(size)
      {
        case "short":
        case "medium":
          return qx.locale.Date.getDateTimeFormat("HHmm", "HH:mm");

        case "long":
          return qx.locale.Date.getDateTimeFormat("HHmmss", "HH:mm:ss");

        case "full":
          return qx.locale.Date.getDateTimeFormat("HHmmsszz", "HH:mm:ss zz");

        default:
          throw new Error("This case should never happen.");
      }
    },


    /**
     * Return the day the week starts with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the week. 0=sunday, 1=monday, ...
     */
    getWeekStart : function(locale)
    {
      var weekStart =
      {
        // default is monday
        "MV" : 5, // friday
        "AE" : 6, // saturday
        "AF" : 6,
        "BH" : 6,
        "DJ" : 6,
        "DZ" : 6,
        "EG" : 6,
        "ER" : 6,
        "ET" : 6,
        "IQ" : 6,
        "IR" : 6,
        "JO" : 6,
        "KE" : 6,
        "KW" : 6,
        "LB" : 6,
        "LY" : 6,
        "MA" : 6,
        "OM" : 6,
        "QA" : 6,
        "SA" : 6,
        "SD" : 6,
        "SO" : 6,
        "TN" : 6,
        "YE" : 6,
        "AS" : 0, // sunday
        "AU" : 0,
        "AZ" : 0,
        "BW" : 0,
        "CA" : 0,
        "CN" : 0,
        "FO" : 0,
        "GE" : 0,
        "GL" : 0,
        "GU" : 0,
        "HK" : 0,
        "IE" : 0,
        "IL" : 0,
        "IS" : 0,
        "JM" : 0,
        "JP" : 0,
        "KG" : 0,
        "KR" : 0,
        "LA" : 0,
        "MH" : 0,
        "MN" : 0,
        "MO" : 0,
        "MP" : 0,
        "MT" : 0,
        "NZ" : 0,
        "PH" : 0,
        "PK" : 0,
        "SG" : 0,
        "TH" : 0,
        "TT" : 0,
        "TW" : 0,
        "UM" : 0,
        "US" : 0,
        "UZ" : 0,
        "VI" : 0,
        "ZA" : 0,
        "ZW" : 0,
        "MW" : 0,
        "NG" : 0,
        "TJ" : 0
      };

      var territory = qx.locale.Date._getTerritory(locale);

      // default is monday
      return weekStart[territory] != null ? weekStart[territory] : 1;
    },


    /**
     * Return the day the weekend starts with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the first day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendStart : function(locale)
    {
      var weekendStart =
      {
        // default is saturday
        "EG" : 5, // friday
        "IL" : 5,
        "SY" : 5,
        "IN" : 0, // sunday
        "AE" : 4, // thursday
        "BH" : 4,
        "DZ" : 4,
        "IQ" : 4,
        "JO" : 4,
        "KW" : 4,
        "LB" : 4,
        "LY" : 4,
        "MA" : 4,
        "OM" : 4,
        "QA" : 4,
        "SA" : 4,
        "SD" : 4,
        "TN" : 4,
        "YE" : 4
      };

      var territory = qx.locale.Date._getTerritory(locale);

      // default is saturday
      return weekendStart[territory] != null ? weekendStart[territory] : 6;
    },


    /**
     * Return the day the weekend ends with
     *
     * Reference: Common Locale Data Repository (cldr) supplementalData.xml
     *
     * @param locale {String} optional locale to be used
     * @return {Integer} index of the last day of the weekend. 0=sunday, 1=monday, ...
     */
    getWeekendEnd : function(locale)
    {
      var weekendEnd =
      {
        // default is sunday
        "AE" : 5, // friday
        "BH" : 5,
        "DZ" : 5,
        "IQ" : 5,
        "JO" : 5,
        "KW" : 5,
        "LB" : 5,
        "LY" : 5,
        "MA" : 5,
        "OM" : 5,
        "QA" : 5,
        "SA" : 5,
        "SD" : 5,
        "TN" : 5,
        "YE" : 5,
        "AF" : 5,
        "IR" : 5,
        "EG" : 6, // saturday
        "IL" : 6,
        "SY" : 6
      };

      var territory = qx.locale.Date._getTerritory(locale);

      // default is sunday
      return weekendEnd[territory] != null ? weekendEnd[territory] : 0;
    },


    /**
     * Returns whether a certain day of week belongs to the week end.
     *
     * @param day {Integer} index of the day. 0=sunday, 1=monday, ...
     * @param locale {String} optional locale to be used
     * @return {Boolean} whether the given day is a weekend day
     */
    isWeekend : function(day, locale)
    {
      var weekendStart = qx.locale.Date.getWeekendStart(locale);
      var weekendEnd = qx.locale.Date.getWeekendEnd(locale);

      if (weekendEnd > weekendStart) {
        return ((day >= weekendStart) && (day <= weekendEnd));
      } else {
        return ((day >= weekendStart) || (day <= weekendEnd));
      }
    },


    /**
     * Extract the territory part from a locale
     *
     * @param locale {String} the locale
     * @return {String} territory
     */
    _getTerritory : function(locale)
    {
      if (locale) {
        var territory = locale.split("_")[1] || locale;
      } else {
        territory = this.__mgr.getTerritory() || this.__mgr.getLanguage();
      }

      return territory.toUpperCase();
    },

    /**
     * Provide localisation (CLDR) data with fallback between "format" and "stand-alone" contexts.
     * It is used in {@link #getDayName} and {@link #getMonthName} methods.
     *
     * @param context {String} intended context.
     *       Possible values: "format", "stand-alone".
     * @param fallbackContext {String} the context used in case no localisation is found for the key.
     * @param key {String} message id (may contain format strings)
     * @param locale {String} the locale
     * @return {String} localized name for the key
     *
     */
    __localizeWithFallback : function(context, fallbackContext, key, locale)
    {
      var localizedString = this.__mgr.localize(key, [], locale);
      if(localizedString == key)
      {
        var newKey = key.replace('_' + context + '_', '_' + fallbackContext + '_');
        return this.__mgr.localize(newKey, [], locale);
      }
      else
      {
        return localizedString;
      }
    }
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

************************************************************************ */

/**
 * A factory creating widgets to use for editing table cells.
 */
qx.Interface.define("qx.ui.table.ICellEditorFactory",
{

  members :
  {
    /**
     * Creates a cell editor.
     *
     * The cellInfo map contains the following properties:
     * <ul>
     * <li>value (var): the cell's value.</li>
     * <li>row (int): the model index of the row the cell belongs to.</li>
     * <li>col (int): the model index of the column the cell belongs to.</li>
     * <li>xPos (int): the x position of the cell in the table pane.</li>
     * <li>table (qx.ui.table.Table) reference to the table, the cell belongs to. </li>
     * </ul>
     *
     * @abstract
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create.
     * @return {qx.ui.core.Widget} the widget that should be used as cell editor.
     */
    createCellEditor : function(cellInfo) {
      return true;
    },


    /**
     * Returns the current value of a cell editor.
     *
     * @abstract
     * @param cellEditor {qx.ui.core.Widget} The cell editor formally created by
     *      {@link #createCellEditor}.
     * @return {var} the current value from the editor.
     */
    getCellEditorValue : function(cellEditor) {
      return true;
    }
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An abstract cell editor factory creating text/password/spinner/... fields.
 */
qx.Class.define("qx.ui.table.celleditor.AbstractField",
{
  extend : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,
  type : "abstract",


  properties :
  {
    /**
     * function that validates the result
     * the function will be called with the new value and the old value and is
     * supposed to return the value that is set as the table value.
     **/
    validationFunction :
    {
      check : "Function",
      nullable : true,
      init : null
    }
  },


  members :
  {
    /**
     * Factory to create the editor widget
     *
     * @return {qx.ui.core.Widget} The editor widget
     */
    _createEditor : function() {
      throw new Error("Abstract method call!");
    },


    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var cellEditor = this._createEditor();

      cellEditor.originalValue = cellInfo.value;
      if (cellInfo.value === null || cellInfo.value === undefined) {
        cellInfo.value = "";
      }
      cellEditor.setValue("" + cellInfo.value);

      cellEditor.addListener("appear", function() {
        cellEditor.selectAllText();
      });

      return cellEditor;
    },


    // interface implementation
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue();

      // validation function will be called with new and old value
      var validationFunc = this.getValidationFunction();
      if (validationFunc ) {
        value = validationFunc( value, cellEditor.originalValue );
      }

      if (typeof cellEditor.originalValue == "number") {
        value = parseFloat(value);
      }

      return value;
    }
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A cell editor factory creating text fields.
 */
qx.Class.define("qx.ui.table.celleditor.TextField",
{
  extend : qx.ui.table.celleditor.AbstractField,

  members :
  {
    // overridden
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue();

      // validation function will be called with new and old value
      var validationFunc = this.getValidationFunction();
      if (validationFunc ) {
        value = validationFunc( value, cellEditor.originalValue );
      }

      if (typeof cellEditor.originalValue == "number") {
        if (value != null) {
          value = parseFloat(value);
        }
      }
      return value;
    },


    _createEditor : function()
    {
      var cellEditor = new qx.ui.form.TextField();
      cellEditor.setAppearance("table-editor-textfield");
      return cellEditor;
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This is a basic form field with common functionality for
 * {@link TextArea} and {@link TextField}.
 *
 * On every keystroke the value is synchronized with the
 * value of the textfield. Value changes can be monitored by listening to the
 * {@link #input} or {@link #changeValue} events, respectively.
 */
qx.Class.define("qx.ui.form.AbstractField",
{
  extend : qx.ui.core.Widget,
  implement : [
    qx.ui.form.IStringForm,
    qx.ui.form.IForm
  ],
  include : [
    qx.ui.form.MForm
  ],
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String} initial text value of the input field ({@link #setValue}).
   */
  construct : function(value)
  {
    this.base(arguments);

    // shortcut for placeholder feature detection
    this.__useQxPlaceholder = !qx.core.Environment.get("css.placeholder") ||
              (qx.core.Environment.get("engine.name") == "gecko" &&
               parseFloat(qx.core.Environment.get("engine.version")) >= 2);

    if (value != null) {
      this.setValue(value);
    }

    this.getContentElement().addListener(
      "change", this._onChangeContent, this
    );

    // use qooxdoo placeholder if no native placeholder is supported
    if (this.__useQxPlaceholder) {
      // assign the placeholder text after the appearance has been applied
      this.addListener("syncAppearance", this._syncPlaceholder, this);
    }

    // translation support
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener(
        "changeLocale", this._onChangeLocale, this
      );
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * The event is fired on every keystroke modifying the value of the field.
     *
     * The method {@link qx.event.type.Data#getData} returns the
     * current value of the text field.
     */
    "input" : "qx.event.type.Data",


    /**
     * The event is fired each time the text field looses focus and the
     * text field values has changed.
     *
     * If you change {@link #liveUpdate} to true, the changeValue event will
     * be fired after every keystroke and not only after every focus loss. In
     * that mode, the changeValue event is equal to the {@link #input} event.
     *
     * The method {@link qx.event.type.Data#getData} returns the
     * current text value of the field.
     */
    "changeValue" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Alignment of the text
     */
    textAlign :
    {
      check : [ "left", "center", "right" ],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },


    /** Whether the field is read only */
    readOnly :
    {
      check : "Boolean",
      apply : "_applyReadOnly",
      event : "changeReadOnly",
      init : false
    },


    // overridden
    selectable :
    {
      refine : true,
      init : true
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    /** Maximal number of characters that can be entered in the TextArea. */
    maxLength :
    {
      check : "PositiveInteger",
      init : Infinity
    },

    /**
     * Whether the {@link #changeValue} event should be fired on every key
     * input. If set to true, the changeValue event is equal to the
     * {@link #input} event.
     */
    liveUpdate :
    {
      check : "Boolean",
      init : false
    },

    /**
     * String value which will be shown as a hint if the field is all of:
     * unset, unfocused and enabled. Set to null to not show a placeholder
     * text.
     */
    placeholder :
    {
      check : "String",
      nullable : true,
      apply : "_applyPlaceholder"
    },


    /**
     * RegExp responsible for filtering the value of the textfield. the RegExp
     * gives the range of valid values.
     * The following example only allows digits in the textfield.
     * <pre class='javascript'>field.setFilter(/[0-9]/);</pre>
     */
    filter :
    {
      check : "RegExp",
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
    __nullValue : true,
    __placeholder : null,
    __oldValue : null,
    __oldInputValue : null,
    __useQxPlaceholder : true,
    __font : null,
    __webfontListenerId : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getFocusElement : function() {
      var el = this.getContentElement();
      if (el) {
        return el;
      }
    },


    /**
     * Creates the input element. Derived classes may override this
     * method, to create different input elements.
     *
     * @return {qx.html.Input} a new input element.
     */
    _createInputElement : function() {
      return new qx.html.Input("text");
    },


    // overridden
    renderLayout : function(left, top, width, height)
    {
      var updateInsets = this._updateInsets;
      var changes = this.base(arguments, left, top, width, height);

      // Directly return if superclass has detected that no
      // changes needs to be applied
      if (!changes) {
        return;
      }

      var inner = changes.size || updateInsets;
      var pixel = "px";

      if (inner || changes.local || changes.margin)
      {
        var insets = this.getInsets();
        var innerWidth = width - insets.left - insets.right;
        var innerHeight = height - insets.top - insets.bottom;
        // ensure that the width and height never get negative
        innerWidth = innerWidth < 0 ? 0 : innerWidth;
        innerHeight = innerHeight < 0 ? 0 : innerHeight;
      }

      var input = this.getContentElement();

      // we don't need to update positions on native placeholders
      if (updateInsets && this.__useQxPlaceholder)
      {
        // render the placeholder
        this.__getPlaceholderElement().setStyles({
          "left": insets.left + pixel,
          "top": insets.top + pixel
        });
      }

      if (inner)
      {
        // we don't need to update dimensions on native placeholders
        if (this.__useQxPlaceholder) {
          this.__getPlaceholderElement().setStyles({
            "width": innerWidth + pixel,
            "height": innerHeight + pixel
          });
        }

        input.setStyles({
          "width": innerWidth + pixel,
          "height": innerHeight + pixel
        });

        this._renderContentElement(innerHeight, input);

      }
    },


    /**
     * Hook into {@link qx.ui.form.AbstractField#renderLayout} method.
     * Called after the contentElement has a width and an innerWidth.
     *
     * Note: This was introduced to fix BUG#1585
     *
     * @param innerHeight {Integer} The inner height of the element.
     * @param element {Element} The element.
     */
    _renderContentElement : function(innerHeight, element) {
      //use it in child classes
    },


    // overridden
    _createContentElement : function()
    {
      // create and add the input element
      var el = this._createInputElement();

      // Apply styles
      el.setStyles(
      {
        "border": "none",
        "padding": 0,
        "margin": 0,
        "display" : "block",
        "background" : "transparent",
        "outline": "none",
        "appearance": "none",
        "position": "absolute",
        "autoComplete": "off"
      });

      // initialize the html input
      el.setSelectable(this.getSelectable());
      el.setEnabled(this.getEnabled());

      // Add listener for input event
      el.addListener("input", this._onHtmlInput, this);

      // Disable HTML5 spell checking
      el.setAttribute("spellcheck", "false");

      // Block resize handle
      el.setStyle("resize", "none");

      // IE8 in standard mode needs some extra love here to receive events.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        el.setStyles({
          backgroundImage: "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")"
        });
      }

      return el;
    },


    // overridden
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);

      this.getContentElement().setEnabled(value);

      if (this.__useQxPlaceholder) {
        if (value) {
          this._showPlaceholder();
        } else {
          this._removePlaceholder();
        }
      } else {
        var input = this.getContentElement();
        // remove the placeholder on disabled input elements
        input.setAttribute("placeholder", value ? this.getPlaceholder() : "");
      }
    },


    // default text sizes
    /**
     * @lint ignoreReferenceField(__textSize)
     */
    __textSize :
    {
      width : 16,
      height : 16
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this.__textSize.width * 10,
        height : this.__textSize.height || 16
      };
    },


    // overridden
    _applyFont : function(value, old)
    {
      if (old && this.__font && this.__webfontListenerId) {
        this.__font.removeListenerById(this.__webfontListenerId);
        this.__webfontListenerId = null;
      }

      // Apply
      var styles;
      if (value)
      {
        this.__font = qx.theme.manager.Font.getInstance().resolve(value);
        if (this.__font instanceof qx.bom.webfonts.WebFont) {
          this.__webfontListenerId = this.__font.addListener("changeStatus", this._onWebFontStatusChange, this);
        }
        styles = this.__font.getStyles();
      }
      else
      {
        styles = qx.bom.Font.getDefaultStyles();
      }

      // check if text color already set - if so this local value has higher priority
      if (this.getTextColor() != null) {
        delete styles["color"];
      }

      // apply the font to the content element
      this.getContentElement().setStyles(styles);

      // the font will adjust automatically on native placeholders
      if (this.__useQxPlaceholder) {
        // don't apply the color to the placeholder
        delete styles["color"];
        // apply the font to the placeholder
        this.__getPlaceholderElement().setStyles(styles);
      }

      // Compute text size
      if (value) {
        this.__textSize = qx.bom.Label.getTextSize("A", styles);
      } else {
        delete this.__textSize;
      }

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    // overridden
    _applyTextColor : function(value, old)
    {
      if (value) {
        this.getContentElement().setStyle(
          "color", qx.theme.manager.Color.getInstance().resolve(value)
        );
      } else {
        this.getContentElement().removeStyle("color");
      }
    },


    // overridden
    tabFocus : function()
    {
      this.base(arguments);

      this.selectAllText();
    },

    /**
     * Returns the text size.
     * @return {Map} The text size.
     */
    _getTextSize : function() {
      return this.__textSize;
    },

    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for native input events. Redirects the event
     * to the widget. Also checks for the filter and max length.
     *
     * @param e {qx.event.type.Data} Input event
     */
    _onHtmlInput : function(e)
    {
      var value = e.getData();
      var fireEvents = true;

      this.__nullValue = false;

      // value unchanged; Firefox fires "input" when pressing ESC [BUG #5309]
      if (this.__oldInputValue && this.__oldInputValue === value) {
        fireEvents = false;
      }

      // check for the filter
      if (this.getFilter() != null)
      {
        var filteredValue = "";
        var index = value.search(this.getFilter());
        var processedValue = value;
        while(index >= 0)
        {
          filteredValue = filteredValue + (processedValue.charAt(index));
          processedValue = processedValue.substring(index + 1, processedValue.length);
          index = processedValue.search(this.getFilter());
        }

        if (filteredValue != value)
        {
          fireEvents = false;
          value = filteredValue;
          this.getContentElement().setValue(value);
        }
      }

      // check for the max length
      if (value.length > this.getMaxLength())
      {
        fireEvents = false;
        this.getContentElement().setValue(
          value.substr(0, this.getMaxLength())
        );
      }

      // fire the events, if necessary
      if (fireEvents)
      {
        // store the old input value
        this.fireDataEvent("input", value, this.__oldInputValue);
        this.__oldInputValue = value;

        // check for the live change event
        if (this.getLiveUpdate()) {
          this.__fireChangeValueEvent(value);
        }
      }
    },

    /**
     * Triggers text size recalculation after a web font was loaded
     *
     * @param ev {qx.event.type.Data} "changeStatus" event
     */
    _onWebFontStatusChange : function(ev)
    {
      if (ev.getData().valid === true) {
        var styles = this.__font.getStyles();
        this.__textSize = qx.bom.Label.getTextSize("A", styles);
        qx.ui.core.queue.Layout.add(this);
      }
    },


    /**
     * Handles the firing of the changeValue event including the local cache
     * for sending the old value in the event.
     *
     * @param value {String} The new value.
     */
    __fireChangeValueEvent : function(value) {
      var old = this.__oldValue;
      this.__oldValue = value;
      if (old != value) {
        this.fireNonBubblingEvent(
          "changeValue", qx.event.type.Data, [value, old]
        );
      }
    },


    /*
    ---------------------------------------------------------------------------
      TEXTFIELD VALUE API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value of the textfield to the given value.
     *
     * @param value {String} The new value
     */
    setValue : function(value)
    {
      // handle null values
      if (value === null) {
        // just do nothing if null is already set
        if (this.__nullValue) {
          return value;
        }
        value = "";
        this.__nullValue = true;
      } else {
        this.__nullValue = false;
        // native placeholders will be removed by the browser
        if (this.__useQxPlaceholder) {
          this._removePlaceholder();
        }
      }

      if (qx.lang.Type.isString(value))
      {
        var elem = this.getContentElement();
        if (value.length > this.getMaxLength()) {
          value = value.substr(0, this.getMaxLength());
        }
        if (elem.getValue() != value)
        {
          var oldValue = elem.getValue();
          elem.setValue(value);
          var data = this.__nullValue ? null : value;
          this.__oldValue = oldValue;
          this.__fireChangeValueEvent(data);
        }
        // native placeholders will be shown by the browser
        if (this.__useQxPlaceholder) {
          this._showPlaceholder();
        }
        return value;
      }
      throw new Error("Invalid value type: " + value);
    },


    /**
     * Returns the current value of the textfield.
     *
     * @return {String|null} The current value
     */
    getValue : function() {
      var value = this.getContentElement().getValue();
      return this.__nullValue ? null : value;
    },


    /**
     * Resets the value to the default
     */
    resetValue : function() {
      this.setValue(null);
    },


    /**
     * Event listener for change event of content element
     *
     * @param e {qx.event.type.Data} Incoming change event
     */
    _onChangeContent : function(e)
    {
      this.__nullValue = e.getData() === null;
      this.__fireChangeValueEvent(e.getData());
    },


    /*
    ---------------------------------------------------------------------------
      TEXTFIELD SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {String|null}
     */
    getTextSelection : function() {
      return this.getContentElement().getTextSelection();
    },


    /**
     * Returns the current selection length.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {Integer|null}
     */
    getTextSelectionLength : function() {
      return this.getContentElement().getTextSelectionLength();
    },


    /**
     * Returns the start of the text selection
     *
     * @return {Integer|null} Start of selection or null if not available
     */
    getTextSelectionStart : function() {
      return this.getContentElement().getTextSelectionStart();
    },


    /**
     * Returns the end of the text selection
     *
     * @return {Integer|null} End of selection or null if not available
     */
    getTextSelectionEnd : function() {
      return this.getContentElement().getTextSelectionEnd();
    },


    /**
     * Set the selection to the given start and end (zero-based).
     * If no end value is given the selection will extend to the
     * end of the textfield's content.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @param start {Integer} start of the selection (zero-based)
     * @param end {Integer} end of the selection
     * @return {void}
     */
    setTextSelection : function(start, end) {
      this.getContentElement().setTextSelection(start, end);
    },


    /**
     * Clears the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {void}
     */
    clearTextSelection : function() {
      this.getContentElement().clearTextSelection();
    },


    /**
     * Selects the whole content
     *
     * @return {void}
     */
    selectAllText : function() {
      this.setTextSelection(0);
    },


    /*
    ---------------------------------------------------------------------------
      PLACEHOLDER HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Helper to show the placeholder text in the field. It checks for all
     * states and possible conditions and shows the placeholder only if allowed.
     */
    _showPlaceholder : function()
    {
      var fieldValue = this.getValue() || "";
      var placeholder = this.getPlaceholder();
      if (
        placeholder != null &&
        fieldValue == "" &&
        !this.hasState("focused") &&
        !this.hasState("disabled")
      )
      {
        if (this.hasState("showingPlaceholder"))
        {
          this._syncPlaceholder();
        }
        else
        {
          // the placeholder will be set as soon as the appearance is applied
          this.addState("showingPlaceholder");
        }
      }
    },


    /**
     * Helper to remove the placeholder. Deletes the placeholder text from the
     * field and removes the state.
     */
    _removePlaceholder: function() {
      if (this.hasState("showingPlaceholder")) {
        this.__getPlaceholderElement().setStyle("visibility", "hidden");
        this.removeState("showingPlaceholder");
      }
    },


    /**
     * Updates the placeholder text with the DOM
     */
    _syncPlaceholder : function ()
    {
      if (this.hasState("showingPlaceholder")) {
        this.__getPlaceholderElement().setStyle("visibility", "visible");
      }
    },


    /**
     * Returns the placeholder label and creates it if necessary.
     */
    __getPlaceholderElement : function()
    {
      if (this.__placeholder == null) {
        // create the placeholder
        this.__placeholder = new qx.html.Label();
        var colorManager = qx.theme.manager.Color.getInstance();
        this.__placeholder.setStyles({
          "visibility" : "hidden",
          "zIndex" : 6,
          "position" : "absolute",
          "color" : colorManager.resolve("text-placeholder")
        });
        this.getContainerElement().add(this.__placeholder);
      }
      return this.__placeholder;
    },


    /**
     * Locale change event handler
     *
     * @signature function(e)
     * @param e {Event} the change event
     */
    _onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e)
      {
        var content = this.getPlaceholder();
        if (content && content.translate) {
          this.setPlaceholder(content.translate());
        }
      },

      "false" : null
    }),


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyPlaceholder : function(value, old)
    {
      if (this.__useQxPlaceholder) {
        this.__getPlaceholderElement().setValue(value);
        if (value != null) {
          this.addListener("focusin", this._removePlaceholder, this);
          this.addListener("focusout", this._showPlaceholder, this);
          this._showPlaceholder();
        } else {
          this.removeListener("focusin", this._removePlaceholder, this);
          this.removeListener("focusout", this._showPlaceholder, this);
          this._removePlaceholder();
        }
      } else {
        // only apply if the widget is enabled
        if (this.getEnabled()) {
          this.getContentElement().setAttribute("placeholder", value);
        }
      }
    },


    // property apply
    _applyTextAlign : function(value, old) {
      this.getContentElement().setStyle("textAlign", value);
    },


    // property apply
    _applyReadOnly : function(value, old)
    {
      var element = this.getContentElement();

      element.setAttribute("readOnly", value);

      if (value)
      {
        this.addState("readonly");
        this.setFocusable(false);
      }
      else
      {
        this.removeState("readonly");
        this.setFocusable(true);
      }
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
    this.__placeholder = this.__font = null;

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }

    if (this.__font && this.__webfontListenerId) {
      this.__font.removeListenerById(this.__webfontListenerId);
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A Input wrap any valid HTML input element and make it accessible
 * through the normalized qooxdoo element interface.
 */
qx.Class.define("qx.html.Input",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param type {String} The type of the input field. Valid values are
   *   <code>text</code>, <code>textarea</code>, <code>select</code>,
   *   <code>checkbox</code>, <code>radio</code>, <code>password</code>,
   *   <code>hidden</code>, <code>submit</code>, <code>image</code>,
   *   <code>file</code>, <code>search</code>, <code>reset</code>,
   *   <code>select</code> and <code>textarea</code>.
   * @param styles {Map?null} optional map of CSS styles, where the key is the name
   *    of the style and the value is the value to use.
   * @param attributes {Map?null} optional map of element attributes, where the
   *    key is the name of the attribute and the value is the value to use.
   */
  construct : function(type, styles, attributes)
  {
    // Update node name correctly
    if (type === "select" || type === "textarea") {
      var nodeName = type;
    } else {
      nodeName = "input";
    }

    this.base(arguments, nodeName, styles, attributes);

    this.__type = type;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __type : null,
    // used for webkit only
    __selectable : null,
    __enabled : null,

    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    //overridden
    _createDomElement : function() {
      return qx.bom.Input.create(this.__type);
    },


    // overridden
    _applyProperty : function(name, value)
    {
      this.base(arguments, name, value);
      var element = this.getDomElement();

      if (name === "value") {
        qx.bom.Input.setValue(element, value);
      } else if (name === "wrap") {
        qx.bom.Input.setWrap(element, value);

        // qx.bom.Input#setWrap has the side-effect that the CSS property
        // overflow is set via DOM methods, causing queue and DOM to get
        // out of sync. Mirror all overflow properties to handle the case
        // when group and x/y property differ.
        this.setStyle("overflow", element.style.overflow, true);
        this.setStyle("overflowX", element.style.overflowX, true);
        this.setStyle("overflowY", element.style.overflowY, true);
      }
    },


    /**
     * Set the input element enabled / disabled.
     * Webkit needs a special treatment because the set color of the input
     * field changes automatically. Therefore, we use
     * <code>-webkit-user-modify: read-only</code> and
     * <code>-webkit-user-select: none</code>
     * for disabling the fields in webkit. All other browsers use the disabled
     * attribute.
     *
     * @param value {Boolean} true, if the inpout element should be enabled.
     */
    setEnabled : qx.core.Environment.select("engine.name",
    {
      "webkit" : function(value)
      {
        this.__enabled = value;

        if (!value) {
          this.setStyles({
            "userModify": "read-only",
            "userSelect": "none"
          });
        } else {
          this.setStyles({
            "userModify": null,
            "userSelect": this.__selectable ? null : "none"
          });
        }
      },

      "default" : function(value)
      {
        this.setAttribute("disabled", value===false);
      }
    }),


    /**
     * Set whether the element is selectable. It uses the qooxdoo attribute
     * qxSelectable with the values 'on' or 'off'.
     * In webkit, a special css property will be used and checks for the
     * enabled state.
     *
     * @param value {Boolean} True, if the element should be selectable.
     */
    setSelectable : qx.core.Environment.select("engine.name",
    {
      "webkit" : function(value)
      {
        this.__selectable = value;

        // Only apply the value when it is enabled
        this.base(arguments, this.__enabled && value);
      },

      "default" : function(value)
      {
        this.base(arguments, value);
      }
    }),



    /*
    ---------------------------------------------------------------------------
      INPUT API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the value of the input element.
     *
     * @param value {var} the new value
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setValue : function(value)
    {
      var element = this.getDomElement();

      if (element)
      {
        // Do not overwrite when already correct (on input events)
        // This is needed to keep caret position while typing.
        if (element.value != value) {
          qx.bom.Input.setValue(element, value);
        }
      }
      else
      {
        this._setProperty("value", value);
      }

      return this;
    },


    /**
     * Get the current value.
     *
     * @return {String} The element's current value.
     */
    getValue : function()
    {
      var element = this.getDomElement();

      if (element) {
        return qx.bom.Input.getValue(element);
      }

      return this._getProperty("value") || "";
    },


    /**
     * Sets the text wrap behavior of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     * @param direct {Boolean?false} Whether the execution should be made
     *  directly when possible
     * @return {qx.html.Input} This instance for for chaining support.
     */
    setWrap : function(wrap, direct)
    {
      if (this.__type === "textarea") {
        this._setProperty("wrap", wrap, direct);
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }

      return this;
    },


    /**
     * Gets the text wrap behavior of a text area element.
     *
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     *
     * @return {Boolean} Whether wrapping is enabled or disabled.
     */
    getWrap : function()
    {
      if (this.__type === "textarea") {
        return this._getProperty("wrap");
      } else {
        throw new Error("Text wrapping is only support by textareas!");
      }
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

   ======================================================================

   This class contains code based on the following work:

   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/* ************************************************************************
#require(qx.lang.Array#contains)
************************************************************************ */

/**
 * Cross browser abstractions to work with input elements.
 */
qx.Bootstrap.define("qx.bom.Input",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Map} Internal data structures with all supported input types */
    __types :
    {
      text : 1,
      textarea : 1,
      select : 1,
      checkbox : 1,
      radio : 1,
      password : 1,
      hidden : 1,
      submit : 1,
      image : 1,
      file : 1,
      search : 1,
      reset : 1,
      button : 1
    },


    /**
     * Creates an DOM input/textarea/select element.
     *
     * Attributes may be given directly with this call. This is critical
     * for some attributes e.g. name, type, ... in many clients.
     *
     * Note: <code>select</code> and <code>textarea</code> elements are created
     * using the identically named <code>type</code>.
     *
     * @param type {String} Any valid type for HTML, <code>select</code>
     *   and <code>textarea</code>
     * @param attributes {Map} Map of attributes to apply
     * @param win {Window} Window to create the element for
     * @return {Element} The created input node
     */
    create : function(type, attributes, win)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertKeyInMap(type, this.__types, "Unsupported input type.");
      }

      // Work on a copy to not modify given attributes map
      var attributes = attributes ? qx.lang.Object.clone(attributes) : {};

      var tag;

      if (type === "textarea" || type === "select")
      {
        tag = type;
      }
      else
      {
        tag = "input";
        attributes.type = type;
      }

      return qx.dom.Element.create(tag, attributes, win);
    },


    /**
     * Applies the given value to the element.
     *
     * Normally the value is given as a string/number value and applied
     * to the field content (textfield, textarea) or used to
     * detect whether the field is checked (checkbox, radiobutton).
     *
     * Supports array values for selectboxes (multiple-selection)
     * and checkboxes or radiobuttons (for convenience).
     *
     * Please note: To modify the value attribute of a checkbox or
     * radiobutton use {@link qx.bom.element.Attribute#set} instead.
     *
     * @param element {Element} element to update
     * @param value {String|Number|Array} the value to apply
     */
    setValue : function(element, value)
    {
      var tag = element.nodeName.toLowerCase();
      var type = element.type;
      var Array = qx.lang.Array;
      var Type = qx.lang.Type;

      if (typeof value === "number") {
        value += "";
      }

      if ((type === "checkbox" || type === "radio"))
      {
        if (Type.isArray(value)) {
          element.checked = Array.contains(value, element.value);
        } else {
          element.checked = element.value == value;
        }
      }
      else if (tag === "select")
      {
        var isArray = Type.isArray(value);
        var options = element.options;
        var subel, subval;

        for (var i=0, l=options.length; i<l; i++)
        {
          subel = options[i];
          subval = subel.getAttribute("value");
          if (subval == null) {
            subval = subel.text;
          }

          subel.selected = isArray ?
             Array.contains(value, subval) : value == subval;
        }

        if (isArray && value.length == 0) {
          element.selectedIndex = -1;
        }
      }
      else if ((type === "text" || type === "textarea") &&
        (qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // These flags are required to detect self-made property-change
        // events during value modification. They are used by the Input
        // event handler to filter events.
        element.$$inValueSet = true;
        element.value = value;
        element.$$inValueSet = null;
      }
      else
      {
        element.value = value;
      }
    },


    /**
     * Returns the currently configured value.
     *
     * Works with simple input fields as well as with
     * select boxes or option elements.
     *
     * Returns an array in cases of multi-selection in
     * select boxes but in all other cases a string.
     *
     * @param element {Element} DOM element to query
     * @return {String|Array} The value of the given element
     */
    getValue : function(element)
    {
      var tag = element.nodeName.toLowerCase();

      if (tag === "option") {
        return (element.attributes.value || {}).specified ? element.value : element.text;
      }

      if (tag === "select")
      {
        var index = element.selectedIndex;

        // Nothing was selected
        if (index < 0) {
          return null;
        }

        var values = [];
        var options = element.options;
        var one = element.type == "select-one";
        var clazz = qx.bom.Input;
        var value;

        // Loop through all the selected options
        for (var i=one ? index : 0, max=one ? index+1 : options.length; i<max; i++)
        {
          var option = options[i];

          if (option.selected)
          {
            // Get the specifc value for the option
            value = clazz.getValue(option);

            // We don't need an array for one selects
            if (one) {
              return value;
            }

            // Multi-Selects return an array
            values.push(value);
          }
        }

        return values;
      }
      else
      {
        return (element.value || "").replace(/\r/g, "");
      }
    },


    /**
     * Sets the text wrap behaviour of a text area element.
     * This property uses the attribute "wrap" respectively
     * the style property "whiteSpace"
     *
     * @signature function(element, wrap)
     * @param element {Element} DOM element to modify
     * @param wrap {Boolean} Whether to turn text wrap on or off.
     */
    setWrap : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function(element, wrap) {
        var wrapValue = wrap ? "soft" : "off";

        // Explicitly set overflow-y CSS property to auto when wrapped,
        // allowing the vertical scroll-bar to appear if necessary
        var styleValue = wrap ? "auto" : "";

        element.wrap = wrapValue;
        element.style.overflowY = styleValue;
      },

      "gecko|webkit" : function(element, wrap)
      {
        var wrapValue = wrap ? "soft" : "off";
        var styleValue = wrap ? "" : "auto";

        element.setAttribute("wrap", wrapValue);
        element.style.overflow = styleValue;
      },

      "default" : function(element, wrap) {
        element.style.whiteSpace = wrap ? "normal" : "nowrap";
      }
    })
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
     * Fabian Jakobs (fjakobs)
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/**
 * The TextField is a single-line text input field.
 */
qx.Class.define("qx.ui.form.TextField",
{
  extend : qx.ui.form.AbstractField,


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
      init : "textfield"
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    },

    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  },

  members : {

    // overridden
    _renderContentElement : function(innerHeight, element) {
     if ((qx.core.Environment.get("engine.name") == "mshtml") &&
         (parseInt(qx.core.Environment.get("engine.version"), 10) < 9
         || qx.core.Environment.get("browser.documentmode") < 9))
     {
       element.setStyles({
         "line-height" : innerHeight + 'px'
       });
     }
    }
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

************************************************************************ */

/**
 * A cell renderer for header cells.
 */
qx.Interface.define("qx.ui.table.IHeaderRenderer",
{

  members :
  {
    /**
     * Creates a header cell.
     *
     * The cellInfo map contains the following properties:
     * <ul>
     * <li>col (int): the model index of the column.</li>
     * <li>xPos (int): the x position of the column in the table pane.</li>
     * <li>name (string): the name of the column.</li>
     * <li>editable (boolean): whether the column is editable.</li>
     * <li>sorted (boolean): whether the column is sorted.</li>
     * <li>sortedAscending (boolean): whether sorting is ascending.</li>
     * </ul>
     *
     * @abstract
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create.
     * @return {qx.ui.core.Widget} the widget that renders the header cell.
     */
    createHeaderCell : function(cellInfo) {
      return true;
    },


    /**
     * Updates a header cell.
     *
     * @abstract
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create. This map has the same structure as in {@link #createHeaderCell}.
     * @param cellWidget {qx.ui.core.Widget} the widget that renders the header cell. This is
     *      the same widget formally created by {@link #createHeaderCell}.
     * @return {void}
     */
    updateHeaderCell : function(cellInfo, cellWidget) {
      return true;
    }
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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The default header cell renderer.
 *
 * @state hovered {table-header-cell}
 */
qx.Class.define("qx.ui.table.headerrenderer.Default",
{
  extend : qx.core.Object,
  implement : qx.ui.table.IHeaderRenderer,





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {String} The state which will be set for header cells of sorted columns.
     */
    STATE_SORTED           : "sorted",


    /**
     * {String} The state which will be set when sorting is ascending.
     */
    STATE_SORTED_ASCENDING : "sortedAscending"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * ToolTip to show if the mouse hovers of the icon
     */
    toolTip :
    {
      check : "String",
      init : null,
      nullable : true
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
    createHeaderCell : function(cellInfo)
    {
      var widget = new qx.ui.table.headerrenderer.HeaderCell();
      this.updateHeaderCell(cellInfo, widget);

      return widget;
    },


    // overridden
    updateHeaderCell : function(cellInfo, cellWidget)
    {
      var DefaultHeaderCellRenderer = qx.ui.table.headerrenderer.Default;

      // check for localization [BUG #2699]
      if (cellInfo.name && cellInfo.name.translate) {
        cellWidget.setLabel(cellInfo.name.translate());
      } else {
        cellWidget.setLabel(cellInfo.name);
      }

      // Set image tooltip if given
      var widgetToolTip = cellWidget.getToolTip();
      if (this.getToolTip() != null)
      {
        if (widgetToolTip == null)
        {
          // We have no tooltip yet -> Create one
          widgetToolTip = new qx.ui.tooltip.ToolTip(this.getToolTip());
          cellWidget.setToolTip(widgetToolTip);
          // Link disposer to cellwidget to prevent memory leak
          qx.util.DisposeUtil.disposeTriggeredBy(widgetToolTip, cellWidget);
        }
        else
        {
          // Update tooltip text
          widgetToolTip.setLabel(this.getToolTip());
        }
      }

      cellInfo.sorted ?
        cellWidget.addState(DefaultHeaderCellRenderer.STATE_SORTED) :
        cellWidget.removeState(DefaultHeaderCellRenderer.STATE_SORTED);

      cellInfo.sortedAscending ?
        cellWidget.addState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING) :
        cellWidget.removeState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING);
    }
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The default header cell widget
 *
 * @childControl label {qx.ui.basic.Label} label of the header cell
 * @childControl sort-icon {qx.ui.basic.Image} sort icon of the header cell
 * @childControl icon {qx.ui.basic.Image} icon of the header cell
 */
qx.Class.define("qx.ui.table.headerrenderer.HeaderCell",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui.layout.Grid();
    layout.setRowFlex(0, 1);
    layout.setColumnFlex(1, 1);
    layout.setColumnFlex(2, 1);
    this.setLayout(layout);
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "table-header-cell"
    },

    /** header cell label */
    label :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyLabel"
    },

    /** The icon URL of the sorting indicator */
    sortIcon :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applySortIcon",
      themeable : true
    },

    /** Icon URL */
    icon :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyIcon"
    }
  },

  members :
  {
    // property apply
    _applyLabel : function(value, old)
    {
      if (value) {
        this._showChildControl("label").setValue(value);
      } else {
        this._excludeChildControl("label");
      }
    },


    // property apply
    _applySortIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("sort-icon").setSource(value);
      } else {
        this._excludeChildControl("sort-icon");
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "label":
          control = new qx.ui.basic.Label(this.getLabel()).set({
            anonymous: true,
            allowShrinkX: true
          });

          this._add(control, {row: 0, column: 1});
          break;

        case "sort-icon":
          control = new qx.ui.basic.Image(this.getSortIcon());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 2});
          break;

        case "icon":
          control = new qx.ui.basic.Image(this.getIcon()).set({
            anonymous: true,
            allowShrinkX: true
          });
          this._add(control, {row: 0, column: 0});
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});/* ************************************************************************

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

************************************************************************ */

/**
 * A model that contains all meta data about columns, such as width, renderer,
 * visibility and order.
 *
 * @see qx.ui.table.ITableModel
 */
qx.Class.define("qx.ui.table.columnmodel.Basic",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this.__overallColumnArr = [];
    this.__visibleColumnArr = [];
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {

    /**
     * Fired when the width of a column has changed. The data property of the event is
     * a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column the width of which has changed.</li>
     *   <li>newWidth: The new width of the column in pixels.</li>
     *   <li>oldWidth: The old width of the column in pixels.</li>
     * </ul>
     */
    "widthChanged" : "qx.event.type.Data",

    /**
     * Fired when the visibility of a column has changed. This event is equal to
      * "visibilityChanged", but is fired right before.
     */
    "visibilityChangedPre" : "qx.event.type.Data",

    /**
     * Fired when the visibility of a column has changed. The data property of the
     * event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column the visibility of which has changed.</li>
     *   <li>visible: Whether the column is now visible.</li>
     * </ul>
     */
    "visibilityChanged" : "qx.event.type.Data",

    /**
     * Fired when the column order has changed. The data property of the
     * event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column that was moved.</li>
     *   <li>fromOverXPos: The old overall x position of the column.</li>
     *   <li>toOverXPos: The new overall x position of the column.</li>
     * </ul>
     */
    "orderChanged" : "qx.event.type.Data",

    /**
     * Fired when the cell renderer of a column has changed.
     * The data property of the event is a map having the following attributes:
     * <ul>
     *   <li>col: The model index of the column that was moved.</li>
     * </ul>
     */
    "headerCellRendererChanged" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {Integer} the default width of a column in pixels. */
    DEFAULT_WIDTH           : 100,

    /** {qx.ui.table.headerrenderer.Default} the default header cell renderer. */
    DEFAULT_HEADER_RENDERER : qx.ui.table.headerrenderer.Default,

    /** {qx.ui.table.cellrenderer.Default} the default data cell renderer. */
    DEFAULT_DATA_RENDERER   : qx.ui.table.cellrenderer.Default,

    /** {qx.ui.table.celleditor.TextField} the default editor factory. */
    DEFAULT_EDITOR_FACTORY  : qx.ui.table.celleditor.TextField
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __internalChange : null,
    __colToXPosMap : null,
    __visibleColumnArr : null,
    __overallColumnArr : null,
    __columnDataArr : null,

    __headerRenderer : null,
    __dataRenderer : null,
    __editorFactory : null,


    /**
     * Initializes the column model.
     *
     * @param colCount {Integer}
     *   The number of columns the model should have.
     *
     * @param table {qx.ui.table.Table}
     *   The table to which this column model is attached.
     */
    init : function(colCount, table)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(colCount, "Invalid argument 'colCount'.");
      }

      this.__columnDataArr = [];

      var width = qx.ui.table.columnmodel.Basic.DEFAULT_WIDTH;
      var headerRenderer = this.__headerRenderer ||  (this.__headerRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_HEADER_RENDERER());
      var dataRenderer = this.__dataRenderer || (this.__dataRenderer = new qx.ui.table.columnmodel.Basic.DEFAULT_DATA_RENDERER());
      var editorFactory = this.__editorFactory || (this.__editorFactory = new qx.ui.table.columnmodel.Basic.DEFAULT_EDITOR_FACTORY());
      this.__overallColumnArr = [];
      this.__visibleColumnArr = [];

      // Get the initially hidden column array, if one was provided. Older
      // subclasses may not provide the 'table' argument, so we treat them
      // traditionally with no initially hidden columns.
      var initiallyHiddenColumns;

      // Was a table provided to us?
      if (table)
      {
        // Yup. Get its list of initially hidden columns, if the user provided
        // such a list.
        initiallyHiddenColumns = table.getInitiallyHiddenColumns();
      }

      // If no table was specified, or if the user didn't provide a list of
      // initially hidden columns, use an empty list.
      initiallyHiddenColumns = initiallyHiddenColumns || [];


      for (var col=0; col<colCount; col++)
      {
        this.__columnDataArr[col] =
        {
          width          : width,
          headerRenderer : headerRenderer,
          dataRenderer   : dataRenderer,
          editorFactory  : editorFactory
        };

        this.__overallColumnArr[col] = col;
        this.__visibleColumnArr[col] = col;
      }

      this.__colToXPosMap = null;

      // If any columns are initialy hidden, hide them now. Make it an
      // internal change so that events are not generated.
      this.__internalChange = true;
      for (var hidden=0; hidden<initiallyHiddenColumns.length; hidden++)
      {
        this.setColumnVisible(initiallyHiddenColumns[hidden], false);
      }
      this.__internalChange = false;

      for (col=0; col<colCount; col++)
      {
        var data =
        {
          col     : col,
          visible : this.isColumnVisible(col)
        };

        this.fireDataEvent("visibilityChangedPre", data);
        this.fireDataEvent("visibilityChanged", data);
      }
    },


    /**
     * Return the array of visible columns
     *
     * @return {Array} List of all visible columns
     */
    getVisibleColumns : function() {
      return this.__visibleColumnArr != null ? this.__visibleColumnArr : [];
    },


    /**
     * Sets the width of a column.
     *
     * @param col {Integer}
     *   The model index of the column.
     *
     * @param width {Integer}
     *   The new width the column should get in pixels.
     *
     * @param isMouseAction {Boolean}
     *   <i>true</i> if the column width is being changed as a result of a
     *   mouse drag in the header; false or undefined otherwise.
     *
     * @return {void}
     */
    setColumnWidth : function(col, width, isMouseAction)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInteger(width, "Invalid argument 'width'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      var oldWidth = this.__columnDataArr[col].width;

      if (oldWidth != width)
      {
        this.__columnDataArr[col].width = width;

        var data =
        {
          col           : col,
          newWidth      : width,
          oldWidth      : oldWidth,
          isMouseAction : isMouseAction || false
        };

        this.fireDataEvent("widthChanged", data);
      }
    },


    /**
     * Returns the width of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the width of the column in pixels.
     */
    getColumnWidth : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].width;
    },


    /**
     * Sets the header renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param renderer {qx.ui.table.IHeaderRenderer} the new header renderer the column
     *      should get.
     * @return {void}
     */
    setHeaderCellRenderer : function(col, renderer)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInterface(renderer, qx.ui.table.IHeaderRenderer, "Invalid argument 'renderer'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      var oldRenderer = this.__columnDataArr[col].headerRenderer;
      if (oldRenderer !== this.__headerRenderer) {
        oldRenderer.dispose();
      }

      this.__columnDataArr[col].headerRenderer = renderer;
      this.fireDataEvent("headerCellRendererChanged", {col:col});
    },


    /**
     * Returns the header renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {qx.ui.table.IHeaderRenderer} the header renderer of the column.
     */
    getHeaderCellRenderer : function(col)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].headerRenderer;
    },


    /**
     * Sets the data renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param renderer {qx.ui.table.ICellRenderer} the new data renderer
     *   the column should get.
     * @return {qx.ui.table.ICellRenderer?null} If an old renderer was set and
     *   it was not the default renderer, the old renderer is returned for
     *   pooling or disposing.
     */
    setDataCellRenderer : function(col, renderer)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInterface(renderer, qx.ui.table.ICellRenderer, "Invalid argument 'renderer'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      this.__columnDataArr[col].dataRenderer = renderer;

      var oldRenderer = this.__columnDataArr[col].dataRenderer;
      if (oldRenderer !== this.__dataRenderer) {
        return oldRenderer;
      }
      return null;
    },


    /**
     * Returns the data renderer of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {qx.ui.table.ICellRenderer} the data renderer of the column.
     */
    getDataCellRenderer : function(col)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].dataRenderer;
    },


    /**
     * Sets the cell editor factory of a column.
     *
     * @param col {Integer} the model index of the column.
     * @param factory {qx.ui.table.ICellEditorFactory} the new cell editor factory the column should get.
     * @return {void}
     */
    setCellEditorFactory : function(col, factory)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertInterface(factory, qx.ui.table.ICellEditorFactory, "Invalid argument 'factory'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      var oldFactory = this.__columnDataArr[col].editorFactory;
      if (oldFactory !== this.__editorFactory) {
        oldFactory.dispose();
      }

      this.__columnDataArr[col].editorFactory = factory;
    },


    /**
     * Returns the cell editor factory of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {qx.ui.table.ICellEditorFactory} the cell editor factory of the column.
     */
    getCellEditorFactory : function(col)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertNotUndefined(this.__columnDataArr[col], "Column not found in table model");
      }

      return this.__columnDataArr[col].editorFactory;
    },


    /**
     * Returns the map that translates model indexes to x positions.
     *
     * The returned map contains for a model index (int) a map having two
     * properties: overX (the overall x position of the column, int) and
     * visX (the visible x position of the column, int). visX is missing for
     * hidden columns.
     *
     * @return {Map} the "column to x position" map.
     */
    _getColToXPosMap : function()
    {
      if (this.__colToXPosMap == null)
      {
        this.__colToXPosMap = {};

        for (var overX=0; overX<this.__overallColumnArr.length; overX++)
        {
          var col = this.__overallColumnArr[overX];
          this.__colToXPosMap[col] = { overX : overX };
        }

        for (var visX=0; visX<this.__visibleColumnArr.length; visX++)
        {
          var col = this.__visibleColumnArr[visX];
          this.__colToXPosMap[col].visX = visX;
        }
      }

      return this.__colToXPosMap;
    },


    /**
     * Returns the number of visible columns.
     *
     * @return {Integer} the number of visible columns.
     */
    getVisibleColumnCount : function() {
      return this.__visibleColumnArr != null ? this.__visibleColumnArr.length : 0;
    },


    /**
     * Returns the model index of a column at a certain visible x position.
     *
     * @param visXPos {Integer} the visible x position of the column.
     * @return {Integer} the model index of the column.
     */
    getVisibleColumnAtX : function(visXPos)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(visXPos, "Invalid argument 'visXPos'.");
      }

      return this.__visibleColumnArr[visXPos];
    },


    /**
     * Returns the visible x position of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the visible x position of the column.
     */
    getVisibleX : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
      }

      return this._getColToXPosMap()[col].visX;
    },


    /**
     * Returns the overall number of columns (including hidden columns).
     *
     * @return {Integer} the overall number of columns.
     */
    getOverallColumnCount : function() {
      return this.__overallColumnArr.length;
    },


    /**
     * Returns the model index of a column at a certain overall x position.
     *
     * @param overXPos {Integer} the overall x position of the column.
     * @return {Integer} the model index of the column.
     */
    getOverallColumnAtX : function(overXPos)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(overXPos, "Invalid argument 'overXPos'.");
      }

      return this.__overallColumnArr[overXPos];
    },


    /**
     * Returns the overall x position of a column.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the overall x position of the column.
     */
    getOverallX : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
      }

      return this._getColToXPosMap()[col].overX;
    },


    /**
     * Returns whether a certain column is visible.
     *
     * @param col {Integer} the model index of the column.
     * @return {Boolean} whether the column is visible.
     */
    isColumnVisible : function(col)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInteger(col, "Invalid argument 'col'.");
      }

      return (this._getColToXPosMap()[col].visX != null);
    },


    /**
     * Sets whether a certain column is visible.
     *
     * @param col {Integer} the model index of the column.
     * @param visible {Boolean} whether the column should be visible.
     * @return {void}
     */
    setColumnVisible : function(col, visible)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(col, "Invalid argument 'col'.");
        this.assertBoolean(visible, "Invalid argument 'visible'.");
      }

      if (visible != this.isColumnVisible(col))
      {
        if (visible)
        {
          var colToXPosMap = this._getColToXPosMap();

          var overX = colToXPosMap[col].overX;

          if (overX == null) {
            throw new Error("Showing column failed: " + col + ". The column is not added to this TablePaneModel.");
          }

          // get the visX of the next visible column after the column to show
          var nextVisX;

          for (var x=overX+1; x<this.__overallColumnArr.length; x++)
          {
            var currCol = this.__overallColumnArr[x];
            var currVisX = colToXPosMap[currCol].visX;

            if (currVisX != null)
            {
              nextVisX = currVisX;
              break;
            }
          }

          // If there comes no visible column any more, then show the column
          // at the end
          if (nextVisX == null) {
            nextVisX = this.__visibleColumnArr.length;
          }

          // Add the column to the visible columns
          this.__visibleColumnArr.splice(nextVisX, 0, col);
        }
        else
        {
          var visX = this.getVisibleX(col);
          this.__visibleColumnArr.splice(visX, 1);
        }

        // Invalidate the __colToXPosMap
        this.__colToXPosMap = null;

        // Inform the listeners
        if (!this.__internalChange)
        {
          var data =
          {
            col     : col,
            visible : visible
          };

          this.fireDataEvent("visibilityChangedPre", data);
          this.fireDataEvent("visibilityChanged", data);
        }
      }
    },


    /**
     * Moves a column.
     *
     * @param fromOverXPos {Integer} the overall x position of the column to move.
     * @param toOverXPos {Integer} the overall x position of where the column should be
     *      moved to.
     */
    moveColumn : function(fromOverXPos, toOverXPos)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInteger(fromOverXPos, "Invalid argument 'fromOverXPos'.");
        this.assertInteger(toOverXPos, "Invalid argument 'toOverXPos'.");
      }

      this.__internalChange = true;

      var col = this.__overallColumnArr[fromOverXPos];
      var visible = this.isColumnVisible(col);

      if (visible) {
        this.setColumnVisible(col, false);
      }

      this.__overallColumnArr.splice(fromOverXPos, 1);
      this.__overallColumnArr.splice(toOverXPos, 0, col);

      // Invalidate the __colToXPosMap
      this.__colToXPosMap = null;

      if (visible) {
        this.setColumnVisible(col, true);
      }
      this.__internalChange = false;

      // Inform the listeners
      var data =
      {
        col          : col,
        fromOverXPos : fromOverXPos,
        toOverXPos   : toOverXPos
      };

      this.fireDataEvent("orderChanged", data);
    },


    /**
     * Reorders all columns to new overall positions. Will fire one "orderChanged" event
     * without data afterwards
     *
     * @param newPositions {Integer[]} Array mapping the index of a column in table model to its wanted overall
     *                            position on screen (both zero based). If the table models holds
     *                            col0, col1, col2 and col3 and you give [1,3,2,0], the new column order
     *                            will be col3, col0, col2, col1
     */
    setColumnsOrder : function(newPositions)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertArray(newPositions, "Invalid argument 'newPositions'.");
      }

      if (newPositions.length == this.__overallColumnArr.length)
      {
        this.__internalChange = true;

        // Go through each column an switch visible ones to invisible. Reason is unknown,
        // this just mimicks the behaviour of moveColumn. Possibly useful because setting
        // a column visible later updates a map with its screen coords.
        var isVisible = new Array(newPositions.length);
        for (var colIdx = 0; colIdx < this.__overallColumnArr.length; colIdx++)
        {
          var visible = this.isColumnVisible(colIdx);
          isVisible[colIdx] = visible; //Remember, as this relies on this.__colToXPosMap which is cleared below
          if (visible){
            this.setColumnVisible(colIdx, false);
          }
        }

        // Store new position values
        this.__overallColumnArr = qx.lang.Array.clone(newPositions);

        // Invalidate the __colToXPosMap
        this.__colToXPosMap = null;

        // Go through each column an switch invisible ones back to visible
        for (var colIdx = 0; colIdx < this.__overallColumnArr.length; colIdx++){
          if (isVisible[colIdx]) {
            this.setColumnVisible(colIdx, true);
          }
        }
        this.__internalChange = false;

        // Inform the listeners. Do not add data as all known listeners in qooxdoo
        // only take this event to mean "total repaint necesscary". Fabian will look
        // after deprecating the data part of the orderChanged - event
        this.fireDataEvent("orderChanged");

      } else {
        throw new Error("setColumnsOrder: Invalid number of column positions given, expected "
                        + this.__overallColumnArr.length + ", got " + newPositions.length);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    for (var i=0; i< this.__columnDataArr.length; i++)
    {
      this.__columnDataArr[i].headerRenderer.dispose();
      this.__columnDataArr[i].dataRenderer.dispose();
      this.__columnDataArr[i].editorFactory.dispose();
    }

    this.__overallColumnArr = this.__visibleColumnArr =
      this.__columnDataArr = this.__colToXPosMap = null;

    this._disposeObjects(
      "__headerRenderer",
      "__dataRenderer",
      "__editorFactory"
    );
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A table column model that automatically resizes columns based on a
 * selected behavior.
 *
 * @see qx.ui.table.columnmodel.Basic
 */
qx.Class.define("qx.ui.table.columnmodel.Resize",
{
  extend : qx.ui.table.columnmodel.Basic,
  include : qx.locale.MTranslation,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // We don't want to recursively call ourself based on our resetting of
    // column sizes.  Track when we're resizing.
    this.__bInProgress = false;

    // Track when the table has appeared.  We want to ignore resize events
    // until then since we won't be able to determine the available width
    // anyway.
    this.__bAppeared = false;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The behavior to use.
     *
     * The provided behavior must extend {@link qx.ui.table.columnmodel.resizebehavior.Abstract} and
     * implement the <i>onAppear</i>, <i>onTableWidthChanged</i>,
     * <i>onColumnWidthChanged</i> and <i>onVisibilityChanged</i>methods.
     */
    behavior :
    {
      check : "qx.ui.table.columnmodel.resizebehavior.Abstract",
      init : null,
      nullable : true,
      apply : "_applyBehavior",
      event : "changeBehavior"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __bAppeared : null,
    __bInProgress : null,
    __table : null,


    // Behavior modifier
    _applyBehavior : function(value, old)
    {
      if (old != null)
      {
        old.dispose();
        old = null;
      }

      // Tell the new behavior how many columns there are
      value._setNumColumns(this.getOverallColumnCount());
      value.setTableColumnModel(this);
    },


    /**
     * Initializes the column model.
     *
     * @param numColumns {Integer} the number of columns the model should have.
     * @param table {qx.ui.table.Table}
     *   The table which this model is used for. This allows us access to
     *   other aspects of the table, as the <i>behavior</i> sees fit.
     */
    init : function(numColumns, table)
    {
      // Call our superclass
      this.base(arguments, numColumns, table);

      if (this.__table == null)
      {
        this.__table = table;
        // We'll do our column resizing when the table appears, ...
        table.addListener("appear", this._onappear, this);

        // ... when the inner width of the table changes, ...
        table.addListener("tableWidthChanged", this._onTableWidthChanged, this);

        // ... when a vertical scroll bar appears or disappears
        table.addListener(
          "verticalScrollBarChanged",
          this._onverticalscrollbarchanged,
          this
        );

        // We want to manipulate the button visibility menu
        table.addListener(
          "columnVisibilityMenuCreateEnd",
          this._addResetColumnWidthButton,
          this
        );

        // ... when columns are resized, ...
        this.addListener("widthChanged", this._oncolumnwidthchanged, this );

        // ... and when a column visibility changes.
        this.addListener("visibilityChanged", this._onvisibilitychanged, this);
      }

      // Set the initial resize behavior
      if (this.getBehavior() == null) {
        this.setBehavior(new qx.ui.table.columnmodel.resizebehavior.Default());
      }

      // Tell the behavior how many columns there are
      this.getBehavior()._setNumColumns(numColumns);
    },


    /**
     * Get the table widget
     *
     * @return {qx.ui.table.Table} the table widget
     */
    getTable : function() {
      return this.__table;
    },


    /**
     * Reset the column widths to their "onappear" defaults.
     *
     * @param event {qx.event.type.Data}
     *   The "columnVisibilityMenuCreateEnd" event indicating that the menu is
     *   being generated.  The data is a map containing properties <i>table</i>
     *   and <i>menu</i>.
     *
     * @return {void}
     */
    _addResetColumnWidthButton : function(event)
    {
      var data = event.getData();
      var columnButton = data.columnButton;
      var menu = data.menu;
      var o;

      // Add a separator between the column names and our reset button
      o = columnButton.factory("separator");
      menu.add(o);

      // Add a button to reset the column widths
      o = columnButton.factory("user-button",
                               {
                                 text : this.tr("Reset column widths")
                               });
      menu.add(o);
      o.addListener("execute", this._onappear, this);
    },


    /**
     * Event handler for the "appear" event.
     *
     * @param event {qx.event.type.Event}
     *   The "onappear" event object.
     *
     * @return {void}
     */
    _onappear : function(event)
    {
      // Is this a recursive call?
      if (this.__bInProgress)
      {
        // Yup.  Ignore it.
        return ;
      }

      this.__bInProgress = true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.tableResizeDebug"))
        {
          this.debug("onappear");
        }
      }

      // this handler is also called by the "execute" event of the menu button
      this.getBehavior().onAppear(event, event.getType() !== "appear");

      this.__table._updateScrollerWidths();
      this.__table._updateScrollBarVisibility();

      this.__bInProgress = false;

      this.__bAppeared = true;
    },


    /**
     * Event handler for the "tableWidthChanged" event.
     *
     * @param event {qx.event.type.Event}
     *   The "onwindowresize" event object.
     *
     * @return {void}
     */
    _onTableWidthChanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.tableResizeDebug"))
        {
          this.debug("ontablewidthchanged");
        }
      }

      this.getBehavior().onTableWidthChanged(event);
      this.__bInProgress = false;
    },


    /**
     * Event handler for the "verticalScrollBarChanged" event.
     *
     * @param event {qx.event.type.Data}
     *   The "verticalScrollBarChanged" event object.  The data is a boolean
     *   indicating whether a vertical scroll bar is now present.
     *
     * @return {void}
     */
    _onverticalscrollbarchanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.tableResizeDebug"))
        {
          this.debug("onverticalscrollbarchanged");
        }
      }

      this.getBehavior().onVerticalScrollBarChanged(event);

      qx.event.Timer.once(function()
      {
        if (this.__table && !this.__table.isDisposed())
        {
          this.__table._updateScrollerWidths();
          this.__table._updateScrollBarVisibility();
        }
      }, this, 0);

      this.__bInProgress = false;
    },


    /**
     * Event handler for the "widthChanged" event.
     *
     * @param event {qx.event.type.Data}
     *   The "widthChanged" event object.
     *
     * @return {void}
     */
    _oncolumnwidthchanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.tableResizeDebug"))
        {
          this.debug("oncolumnwidthchanged");
        }
      }

      this.getBehavior().onColumnWidthChanged(event);
      this.__bInProgress = false;
    },


    /**
     * Event handler for the "visibilityChanged" event.
     *
     * @param event {qx.event.type.Data}
     *   The "visibilityChanged" event object.
     *
     * @return {void}
     */
    _onvisibilitychanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.tableResizeDebug"))
        {
          this.debug("onvisibilitychanged");
        }
      }

      this.getBehavior().onVisibilityChanged(event);
      this.__bInProgress = false;
    }
  },


 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__table = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * All of the resizing information about a column.
 *
 *  This is used internally by qx.ui.table and qx.ui.progressive's table and
 *  may be used for other widgets as well.
 */
qx.Class.define("qx.ui.core.ColumnData",
{
  extend : qx.ui.core.LayoutItem,


  construct : function()
  {
    this.base(arguments);
    this.setColumnWidth("auto");
  },


  members :
  {
    __computedWidth : null,


    // overridden
    renderLayout : function(left, top, width, height) {
      this.__computedWidth = width;
    },


    /**
     * Get the computed width of the column.
     */
    getComputedWidth : function() {
      return this.__computedWidth;
    },


    /**
     * Get the column's flex value
     *
     * @return {Integer} The column's flex value
     */
    getFlex : function()
    {
      return this.getLayoutProperties().flex || 0;
    },


    /**
     * Set the column width. The column width can be one of the following
     * values:
     *
     * * Pixels: e.g. <code>23</code>
     * * Autosized: <code>"auto"</code>
     * * Flex: e.g. <code>"1*"</code>
     * * Percent: e.g. <code>"33%"</code>
     *
     * @param width {Integer|String} The column width
     * @param flex {Integer?0} Optional flex value of the column
     */
    setColumnWidth : function(width, flex)
    {
      var flex = flex || 0;
      var percent = null;

      if (typeof width == "number")
      {
        this.setWidth(width);
      }
      else if (typeof width == "string")
      {
        if (width == "auto") {
          flex = 1;
        }
        else
        {
          var match = width.match(/^[0-9]+(?:\.[0-9]+)?([%\*])$/);
          if (match)
          {
            if (match[1] == "*") {
              flex = parseFloat(width);
            } else {
              percent = width;
            }
          }
        }
      }
      this.setLayoutProperties({
        flex: flex,
        width: percent
      });
    }
  },

  environment :
  {
    "qx.tableResizeDebug" : false
  }
})
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * An abstract resize behavior.  All resize behaviors should extend this
 * class.
 */
qx.Class.define("qx.ui.table.columnmodel.resizebehavior.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Called when the ResizeTableColumnModel is initialized, and upon loading of
     * a new TableModel, to allow the Resize Behaviors to know how many columns
     * are in use.
     *
     * @abstract
     * @param numColumns {Integer} The numbrer of columns in use.
     * @return {void}
     * @throws the abstract function warning.
     */
    _setNumColumns : function(numColumns) {
      throw new Error("_setNumColumns is abstract");
    },


    /**
     * Called when the table has first been rendered.
     *
     * @abstract
     * @param event {var} The <i>onappear</i> event object.
     * @param forceRefresh {Boolean?false} Whether a refresh should be forced
     * @return {void}
     * @throws the abstract function warning.
     */
    onAppear : function(event, forceRefresh) {
      throw new Error("onAppear is abstract");
    },


    /**
     * Called when the table width changes due to either a window size change
     * or a parent object changing size causing the table to change size.
     *
     * @abstract
     * @param event {var} The <i>tableWidthChanged</i> event object.
     * @return {void}
     * @throws the abstract function warning.
     */
    onTableWidthChanged : function(event) {
      throw new Error("onTableWidthChanged is abstract");
    },


    /**
     * Called when the use of vertical scroll bar in the table changes, either
     * from present to not present, or vice versa.
     *
     * @abstract
     * @param event {var} The <i>verticalScrollBarChanged</i> event object.  This event has data,
     *     obtained via event.getValue(), which is a boolean indicating whether a
     *     vertical scroll bar is now present.
     * @return {void}
     * @throws the abstract function warning.
     */
    onVerticalScrollBarChanged : function(event) {
      throw new Error("onVerticalScrollBarChanged is abstract");
    },


    /**
     * Called when a column width is changed.
     *
     * @abstract
     * @param event {var} The <i>widthChanged</i> event object.  This event has data, obtained via
     *     event.getValue(), which is an object with three properties: the column
     *     which changed width (data.col), the old width (data.oldWidth) and the new
     *     width (data.newWidth).
     * @return {void}
     * @throws the abstract function warning.
     */
    onColumnWidthChanged : function(event) {
      throw new Error("onColumnWidthChanged is abstract");
    },


    /**
     * Called when a column visibility is changed.
     *
     * @abstract
     * @param event {var} The <i>visibilityChanged</i> event object.  This event has data, obtained
     *     via event.getValue(), which is an object with two properties: the column
     *     which changed width (data.col) and the new visibility of the column
     *     (data.visible).
     * @return {void}
     * @throws the abstract function warning.
     */
    onVisibilityChanged : function(event) {
      throw new Error("onVisibilityChanged is abstract");
    },

    /**
     * Determine the inner width available to columns in the table.
     *
     * @return {Integer} The available width
     */
    _getAvailableWidth : function()
    {
      var tableColumnModel = this.getTableColumnModel();

      // Get the inner width off the table
      var table = tableColumnModel.getTable();

      var scrollerArr = table._getPaneScrollerArr();
      if (!scrollerArr[0] || !scrollerArr[0].getLayoutParent().getBounds()) {
        return null;
      };
      var scrollerParentWidth = scrollerArr[0].getLayoutParent().getBounds().width;

      var lastScroller = scrollerArr[scrollerArr.length-1];
      scrollerParentWidth -= lastScroller.getPaneInsetRight();

      return scrollerParentWidth;
    }
  }});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#require(qx.ui.core.ColumnData)

************************************************************************ */

/**
 * The default resize behavior.  Until a resize model is loaded, the default
 * behavior is to:
 * <ol>
 *   <li>
 *     Upon the table initially appearing, and upon any window resize, divide
 *     the table space equally between the visible columns.
 *   </li>
 *   <li>
 *     When a column is increased in width, all columns to its right are
 *     pushed to the right with no change to their widths.  This may push some
 *     columns off the right edge of the table, causing a horizontal scroll
 *     bar to appear.
 *   </li>
 *   <li>
 *     When a column is decreased in width, if the total width of all columns
 *     is <i>greater than</i> the table width, no additional column width
 *     change is made.
 *   </li>
 *   <li>
 *     When a column is decreased in width, if the total width of all columns
 *     is <i>less than</i> the table width, the visible column
 *     immediately to the right of the column which decreased in width has its
 *     width increased to fill the remaining space.
 *   </li>
 * </ol>
 *
 * A resize model may be loaded to provide more guidance on how to adjust
 * column width upon each of the events: initial appear, window resize, and
 * column resize. *** TO BE FILLED IN ***
 */
qx.Class.define("qx.ui.table.columnmodel.resizebehavior.Default",
{
  extend : qx.ui.table.columnmodel.resizebehavior.Abstract,


  construct : function()
  {
    this.base(arguments);

    this.__resizeColumnData = [];

    // This layout is not connected to a widget but to this class. This class
    // must implement the method "getLayoutChildren", which must return all
    // columns (LayoutItems) which should be recalcutated. The call
    // "layout.renderLayout" will call the method "renderLayout" on each column
    // data object
    // The advantage of the use of the normal layout manager is that the
    // samantics of flex and percent are exectly the same as in the widget code.
    this.__layout = new qx.ui.layout.HBox();
    this.__layout.connectToWidget(this);

    this.__deferredComputeColumnsFlexWidth = new qx.util.DeferredCall(
      this._computeColumnsFlexWidth, this
    );
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * A function to instantiate a resize behavior column data object.
     */
    newResizeBehaviorColumnData :
    {
      check : "Function",
      init : function(obj)
      {
        return new qx.ui.core.ColumnData();
      }
    },

    /**
     * Whether to reinitialize default widths on each appear event.
     * Typically, one would want to initialize the default widths only upon
     * the first appearance of the table, but the original behavior was to
     * reinitialize it even if the table is hidden and then reshown
     * (e.g. it's in a pageview and the page is switched and then switched
     * back).
     */
    initializeWidthsOnEveryAppear :
    {
      check : "Boolean",
      init  : false
    },

    /**
     * The table column model in use.  Of particular interest is the method
     * <i>getTable</i> which is a reference to the table widget.  This allows
     * access to any other features of the table, for use in calculating widths
     * of columns.
     */
    tableColumnModel :
    {
      check : "qx.ui.table.columnmodel.Resize"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __layout : null,
    __layoutChildren : null,
    __resizeColumnData : null,
    __deferredComputeColumnsFlexWidth : null,

    /**
     * Whether we have initialized widths on the first appear yet
     */
    __widthsInitialized : false,

    /**
     * Set the width of a column.
     *
     * @param col {Integer} The column whose width is to be set
     *
     * @param width {Integer, String}
     *   The width of the specified column.  The width may be specified as
     *   integer number of pixels (e.g. 100), a string representing percentage
     *   of the inner width of the Table (e.g. "25%"), or a string
     *   representing a flex width (e.g. "1*").
     *
     * @param flex {Integer?0} Optional flex value of the column
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setWidth : function(col, width, flex)
    {
      // Ensure the column is within range
      if (col >= this.__resizeColumnData.length) {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this.__resizeColumnData[col].setColumnWidth(width, flex);
      this.__deferredComputeColumnsFlexWidth.schedule();
    },


    /**
     * Set the minimum width of a column.
     *
     * @param col {Integer}
     *   The column whose minimum width is to be set
     *
     * @param width {Integer}
     *   The minimum width of the specified column.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setMinWidth : function(col, width)
    {
      // Ensure the column is within range
      if (col >= this.__resizeColumnData.length)
      {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this.__resizeColumnData[col].setMinWidth(width);
      this.__deferredComputeColumnsFlexWidth.schedule();
    },


    /**
     * Set the maximum width of a column.
     *
     * @param col {Integer}
     *   The column whose maximum width is to be set
     *
     * @param width {Integer}
     *   The maximum width of the specified column.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setMaxWidth : function(col, width)
    {
      // Ensure the column is within range
      if (col >= this.__resizeColumnData.length) {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this.__resizeColumnData[col].setMaxWidth(width);
      this.__deferredComputeColumnsFlexWidth.schedule();
    },


    /**
     * Set any or all of the width, minimum width, and maximum width of a
     * column in a single call.
     *
     * @param col {Integer}
     *   The column whose attributes are to be changed
     *
     * @param map {Map}
     *   A map containing any or all of the property names "width", "minWidth",
     *   and "maxWidth".  The property values are as described for
     *   {@link #setWidth}, {@link #setMinWidth} and {@link #setMaxWidth}
     *   respectively.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    set : function(col, map)
    {
      for (var prop in map)
      {
        switch(prop)
        {
          case "width":
            this.setWidth(col, map[prop]);
            break;

          case "minWidth":
            this.setMinWidth(col, map[prop]);
            break;

          case "maxWidth":
            this.setMaxWidth(col, map[prop]);
            break;

          default:
            throw new Error("Unknown property: " + prop);
        }
      }
    },

    // overloaded
    onAppear : function(event, forceRefresh)
    {
      // If we haven't initialized widths at least once, or
      // they want us to reinitialize widths on every appear event...
      if (forceRefresh === true || !this.__widthsInitialized || this.getInitializeWidthsOnEveryAppear())
      {
        // Calculate column widths
        this._computeColumnsFlexWidth();

        // Track that we've initialized widths at least once
        this.__widthsInitialized = true;
      }
    },

    // overloaded
    onTableWidthChanged : function(event) {
      this._computeColumnsFlexWidth();
    },

    // overloaded
    onVerticalScrollBarChanged : function(event) {
      this._computeColumnsFlexWidth();
    },

    // overloaded
    onColumnWidthChanged : function(event)
    {
      // Extend the next column to fill blank space
      this._extendNextColumn(event);
    },

    // overloaded
    onVisibilityChanged : function(event)
    {
      // Event data properties: col, visible
      var data = event.getData();

      // If a column just became visible, resize all columns.
      if (data.visible)
      {
        this._computeColumnsFlexWidth();
        return;
      }

      // Extend the last column to fill blank space
      this._extendLastColumn(event);
    },

    // overloaded
    _setNumColumns : function(numColumns)
    {
      var colData = this.__resizeColumnData;
      // Are there now fewer (or the same number of) columns than there were
      // previously?
      if (numColumns <= colData.length)
      {
        // Yup.  Delete the extras.
        colData.splice(numColumns, colData.length);
        return;
      }

      // There are more columns than there were previously.  Allocate more.
      for (var i=colData.length; i<numColumns; i++)
      {
        colData[i] = this.getNewResizeBehaviorColumnData()();
        colData[i].columnNumber = i;
      }
    },


    /**
     * This method is required by the box layout. If returns an array of items
     * to relayout.
     *
     * @return {qx.ui.core.ColumnData[]} The list of column data object to layout.
     */
    getLayoutChildren : function() {
      return this.__layoutChildren;
    },


    /**
     * Computes the width of all flexible children.
     *
     * @return {void}
     */
    _computeColumnsFlexWidth : function()
    {
      this.__deferredComputeColumnsFlexWidth.cancel();
      var width = this._getAvailableWidth();

      if (width === null) {
        return;
      }

      var tableColumnModel = this.getTableColumnModel();
      var visibleColumns = tableColumnModel.getVisibleColumns();
      var visibleColumnsLength = visibleColumns.length;
      var colData = this.__resizeColumnData;
      var i, l;

      if (visibleColumnsLength === 0) {
        return;
      }

      // Create an array of the visible columns
      var columns = [ ];
      for (i=0; i<visibleColumnsLength; i++)
      {
        columns.push(colData[visibleColumns[i]]);
      }
      this.__layoutChildren = columns;
      this.__clearLayoutCaches();

      // Use a horizontal box layout to determine the available width.
      this.__layout.renderLayout(width, 100);

      // Now that we've calculated the width, set it.
      for (i=0,l=columns.length; i<l; i++)
      {
        var colWidth = columns[i].getComputedWidth();
        tableColumnModel.setColumnWidth(visibleColumns[i], colWidth);
      }
    },


    /**
     * Clear all layout caches of the column datas.
     */
    __clearLayoutCaches : function()
    {
      this.__layout.invalidateChildrenCache();
      var children = this.__layoutChildren;
      for (var i=0,l=children.length; i<l; i++) {
        children[i].invalidateLayoutCache();
      }
    },


    /**
     * Extend the visible column to right of the column which just changed
     * width, to fill any available space within the inner width of the table.
     * This means that if the sum of the widths of all columns exceeds the
     * inner width of the table, no change is made.  If, on the other hand,
     * the sum of the widths of all columns is less than the inner width of
     * the table, the visible column to the right of the column which just
     * changed width is extended to take up the width available within the
     * inner width of the table.
     *
     *
     * @param event {qx.event.type.Data}
     *   The event object.
     *
     * @return {void}
     */
    _extendNextColumn : function(event)
    {
      var tableColumnModel = this.getTableColumnModel();

      // Event data properties: col, oldWidth, newWidth
      var data = event.getData();

      var visibleColumns = tableColumnModel.getVisibleColumns();

      // Determine the available width
      var width = this._getAvailableWidth();

      // Determine the number of visible columns
      var numColumns = visibleColumns.length;

      // Did this column become longer than it was?
      if (data.newWidth > data.oldWidth)
      {
        // Yup.  Don't resize anything else.  The other columns will just get
        // pushed off and require scrollbars be added (if not already there).
        return ;
      }

      // This column became shorter.  See if we no longer take up the full
      // space that's available to us.
      var i;
      var nextCol;
      var widthUsed = 0;

      for (i=0; i<numColumns; i++) {
        widthUsed += tableColumnModel.getColumnWidth(visibleColumns[i]);
      }

      // If the used width is less than the available width...
      if (widthUsed < width)
      {
        // ... then determine the next visible column
        for (i=0; i<visibleColumns.length; i++)
        {
          if (visibleColumns[i] == data.col)
          {
            nextCol = visibleColumns[i + 1];
            break;
          }
        }

        if (nextCol)
        {
          // Make the next column take up the available space.
          var newWidth =
            (width - (widthUsed - tableColumnModel.getColumnWidth(nextCol)));
          tableColumnModel.setColumnWidth(nextCol, newWidth);
        }
      }
    },


    /**
     * If a column was just made invisible, extend the last column to fill any
     * available space within the inner width of the table.  This means that
     * if the sum of the widths of all columns exceeds the inner width of the
     * table, no change is made.  If, on the other hand, the sum of the widths
     * of all columns is less than the inner width of the table, the last
     * column is extended to take up the width available within the inner
     * width of the table.
     *
     *
     * @param event {qx.event.type.Data}
     *   The event object.
     *
     * @return {void}
     */
    _extendLastColumn : function(event)
    {
      var tableColumnModel = this.getTableColumnModel();

      // Event data properties: col, visible
      var data = event.getData();

      // If the column just became visible, don't make any width changes
      if (data.visible)
      {
        return;
      }

      // Get the array of visible columns
      var visibleColumns = tableColumnModel.getVisibleColumns();

      // If no columns are visible...
      if (visibleColumns.length == 0)
      {
        return;
      }

      // Determine the available width
      var width = this._getAvailableWidth(tableColumnModel);

      // Determine the number of visible columns
      var numColumns = visibleColumns.length;

      // See if we no longer take up the full space that's available to us.
      var i;
      var lastCol;
      var widthUsed = 0;

      for (i=0; i<numColumns; i++) {
        widthUsed += tableColumnModel.getColumnWidth(visibleColumns[i]);
      }

      // If the used width is less than the available width...
      if (widthUsed < width)
      {
        // ... then get the last visible column
        lastCol = visibleColumns[visibleColumns.length - 1];

        // Make the last column take up the available space.
        var newWidth =
          (width - (widthUsed - tableColumnModel.getColumnWidth(lastCol)));
        tableColumnModel.setColumnWidth(lastCol, newWidth);
      }
    },


    /**
     * Returns an array of the resizing information of a column.
     *
     * @return {qx.ui.core.ColumnData[]} array of the resizing information of a column.
     */
    _getResizeColumnData : function()
    {
      return this.__resizeColumnData;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__resizeColumnData = this.__layoutChildren = null;
    this._disposeObjects("__layout", "__deferredComputeColumnsFlexWidth");
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
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Table
 *
 * A detailed description can be found in the package description
 * {@link qx.ui.table}.
 *
 * @childControl statusbar {qx.ui.basic.Label} label to show the status of the table
 * @childControl column-button {qx.ui.table.columnmenu.Button} button to open the column menu
 */
qx.Class.define("qx.ui.table.Table",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param tableModel {qx.ui.table.ITableModel ? null}
   *   The table model to read the data from.
   *
   * @param custom {Map ? null}
   *   A map provided to override the various supplemental classes allocated
   *   within this constructor.  Each property must be a function which
   *   returns an object instance, as indicated by shown the defaults listed
   *   here:
   *
   *   <dl>
   *     <dt>initiallyHiddenColumns</dt>
   *       <dd>
   *         {Array?}
   *         A list of column numbers that should be initially invisible. Any
   *         column not mentioned will be initially visible, and if no array
   *         is provided, all columns will be initially visible.
   *       </dd>
   *     <dt>selectionManager</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.selection.Manager(obj);
   *         }
   *       </pre></dd>
   *     <dt>selectionModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.selection.Model(obj);
   *         }
   *       </pre></dd>
   *     <dt>tableColumnModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.columnmodel.Basic(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Model(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePane</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Pane(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneHeader</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Header(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneScroller</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Scroller(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Model(obj);
   *         }
   *       </pre></dd>
   *     <dt>columnMenu</dt>
   *       <dd><pre class='javascript'>
   *         function()
   *         {
   *           return new qx.ui.table.columnmenu.Button();
   *         }
   *       </pre></dd>
   *   </dl>
   */
  construct : function(tableModel, custom)
  {
    this.base(arguments);
    //
    // Use default objects if custom objects are not specified
    //
    if (!custom) {
      custom = { };
    }

    if (custom.initiallyHiddenColumns) {
      this.setInitiallyHiddenColumns(custom.initiallyHiddenColumns);
    }

    if (custom.selectionManager) {
      this.setNewSelectionManager(custom.selectionManager);
    }

    if (custom.selectionModel) {
      this.setNewSelectionModel(custom.selectionModel);
    }

    if (custom.tableColumnModel) {
      this.setNewTableColumnModel(custom.tableColumnModel);
    }

    if (custom.tablePane) {
      this.setNewTablePane(custom.tablePane);
    }

    if (custom.tablePaneHeader) {
      this.setNewTablePaneHeader(custom.tablePaneHeader);
    }

    if (custom.tablePaneScroller) {
      this.setNewTablePaneScroller(custom.tablePaneScroller);
    }

    if (custom.tablePaneModel) {
      this.setNewTablePaneModel(custom.tablePaneModel);
    }

    if (custom.columnMenu) {
      this.setNewColumnMenu(custom.columnMenu);
    }

    this._setLayout(new qx.ui.layout.VBox());

    // Create the child widgets
    this.__scrollerParent = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    this._add(this.__scrollerParent, {flex: 1});

    // Allocate a default data row renderer
    this.setDataRowRenderer(new qx.ui.table.rowrenderer.Default(this));

    // Create the models
    this.__selectionManager = this.getNewSelectionManager()(this);
    this.setSelectionModel(this.getNewSelectionModel()(this));
    this.setTableModel(tableModel || this.getEmptyTableModel());

    // create the main meta column
    this.setMetaColumnCounts([ -1 ]);

    // Make focusable
    this.setTabIndex(1);
    this.addListener("keypress", this._onKeyPress);
    this.addListener("focus", this._onFocusChanged);
    this.addListener("blur", this._onFocusChanged);

    // attach the resize listener to the last child of the layout. This
    // ensures that all other children are laid out before
    var spacer = new qx.ui.core.Widget().set({
      height: 0
    });
    this._add(spacer);
    spacer.addListener("resize", this._onResize, this);

    this.__focusedCol = null;
    this.__focusedRow = null;

    // add an event listener which updates the table content on locale change
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
    }

    this.initStatusBarVisible();

    // If the table model has an init() method...
    tableModel = this.getTableModel();
    if (tableModel.init && typeof(tableModel.init) == "function")
    {
      // ... then call it now to allow the table model to affect table
      // properties.
      tableModel.init(this);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Dispatched before adding the column list to the column visibility menu.
     * The event data is a map with two properties: table and menu.  Listeners
     * may add additional items to the menu, which appear at the top of the
     * menu.
     */
    "columnVisibilityMenuCreateStart" : "qx.event.type.Data",

    /**
     * Dispatched after adding the column list to the column visibility menu.
     * The event data is a map with two properties: table and menu.  Listeners
     * may add additional items to the menu, which appear at the bottom of the
     * menu.
     */
    "columnVisibilityMenuCreateEnd" : "qx.event.type.Data",

     /**
      * Dispatched when the width of the table has changed.
      */
    "tableWidthChanged" : "qx.event.type.Event",

    /**
     * Dispatched when updating scrollbars discovers that a vertical scrollbar
     * is needed when it previously was not, or vice versa.  The data is a
     * boolean indicating whether a vertical scrollbar is now being used.
     */
    "verticalScrollBarChanged" : "qx.event.type.Data",

    /**
     * Dispatched when a data cell has been clicked.
     */
    "cellClick" : "qx.ui.table.pane.CellEvent",

    /**
     * Dispatched when a data cell has been clicked.
     */
    "cellDblclick" : "qx.ui.table.pane.CellEvent",

    /**
     * Dispatched when the context menu is needed in a data cell
     */
    "cellContextmenu" : "qx.ui.table.pane.CellEvent",

    /**
     * Dispatched after a cell editor is flushed.
     *
     * The data is a map containing this properties:
     * <ul>
     *   <li>row</li>
     *   <li>col</li>
     *   <li>value</li>
     *   <li>oldValue</li>
     * </ul>
     */
    "dataEdited" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Events that must be redirected to the scrollers. */
    __redirectEvents : { cellClick: 1, cellDblclick: 1, cellContextmenu: 1 }
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
      init : "table"
    },


    focusable :
    {
      refine : true,
      init : true
    },


    minWidth :
    {
      refine : true,
      init : 50
    },

    /**
     * The list of columns that are initially hidden. This property is set by
     * the constructor, from the value received in
     * custom.initiallyHiddenColumns, and is only used when a column model is
     * initialized. It can be of great benefit in tables with numerous columns
     * where most are not initially visible. The process of creating the
     * headers for all of the columns, only to have those columns discarded
     * shortly thereafter when setColumnVisibility(false) is called, is a
     * waste of (significant, in some browsers) time. Specifying the
     * non-visible columns at constructor time can therefore avoid the initial
     * creation of all of those superfluous widgets.
     */
    initiallyHiddenColumns :
    {
      init : null
    },

    /**
     * Whether the widget contains content which may be selected by the user.
     *
     * If the value set to <code>true</code> the native browser selection can
     * be used for text selection. But it is normally useful for
     * forms fields, longer texts/documents, editors, etc.
     *
     * Note: This has no effect on Table!
     */
    selectable :
    {
      refine : true,
      init : false
    },


    /** The selection model. */
    selectionModel :
    {
      check : "qx.ui.table.selection.Model",
      apply : "_applySelectionModel",
      event : "changeSelectionModel"
    },


    /** The table model. */
    tableModel :
    {
      check : "qx.ui.table.ITableModel",
      apply : "_applyTableModel",
      event : "changeTableModel"
    },


    /** The height of the table rows. */
    rowHeight :
    {
      check : "Number",
      init : 20,
      apply : "_applyRowHeight",
      event : "changeRowHeight",
      themeable : true
    },


    /**
     * Force line height to match row height.  May be disabled if cell
     * renderers being used wish to render multiple lines of data within a
     * cell.  (With the default setting, all but the first of multiple lines
     * of data will not be visible.)
     */
    forceLineHeight :
    {
      check : "Boolean",
      init  : true
    },


    /**
     *  Whether the header cells are visible. When setting this to false,
     *  you'll likely also want to set the {#columnVisibilityButtonVisible}
     *  property to false as well, to entirely remove the header row.
     */
    headerCellsVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyHeaderCellsVisible",
      themeable : true
    },


    /** The height of the header cells. */
    headerCellHeight :
    {
      check : "Integer",
      init : 16,
      apply : "_applyHeaderCellHeight",
      event : "changeHeaderCellHeight",
      nullable : true,
      themeable : true
    },


    /** Whether to show the status bar */
    statusBarVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyStatusBarVisible"
    },


    /** The Statusbartext, set it, if you want some more Information */
    additionalStatusBarText :
    {
      nullable : true,
      init : null,
      apply : "_applyAdditionalStatusBarText"
    },


    /** Whether to show the column visibility button */
    columnVisibilityButtonVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyColumnVisibilityButtonVisible",
      themeable : true
    },


    /**
     * {Integer[]} The number of columns per meta column. If the last array entry is -1,
     * this meta column will get the remaining columns.
     */
    metaColumnCounts :
    {
      check : "Object",
      apply : "_applyMetaColumnCounts"
    },


    /**
     * Whether the focus should moved when the mouse is moved over a cell. If false
     * the focus is only moved on mouse clicks.
     */
    focusCellOnMouseMove :
    {
      check : "Boolean",
      init : false,
      apply : "_applyFocusCellOnMouseMove"
    },

    /**
     * Whether row focus change by keyboard also modifies selection
     */
    rowFocusChangeModifiesSelection :
    {
      check : "Boolean",
      init : true
    },

    /**
     * Whether the cell focus indicator should be shown
     */
    showCellFocusIndicator :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowCellFocusIndicator"
    },

    /**
     * By default, the "cellContextmenu" event is fired only when a data cell
     * is right-clicked. It is not fired when a right-click occurs in the
     * empty area of the table below the last data row. By turning on this
     * property, "cellContextMenu" events will also be generated when a
     * right-click occurs in that empty area. In such a case, row identifier
     * in the event data will be null, so event handlers can check (row ===
     * null) to handle this case.
     */
    contextMenuFromDataCellsOnly :
    {
      check : "Boolean",
      init : true,
      apply : "_applyContextMenuFromDataCellsOnly"
    },

    /**
     * Whether the table should keep the first visible row complete. If set to false,
     * the first row may be rendered partial, depending on the vertical scroll value.
     */
    keepFirstVisibleRowComplete :
    {
      check : "Boolean",
      init : true,
      apply : "_applyKeepFirstVisibleRowComplete"
    },


    /**
     * Whether the table cells should be updated when only the selection or the
     * focus changed. This slows down the table update but allows to react on a
     * changed selection or a changed focus in a cell renderer.
     */
    alwaysUpdateCells :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether to reset the selection when a header cell is clicked. Since
     * most data models do not have provisions to retain a selection after
     * sorting, the default is to reset the selection in this case. Some data
     * models, however, do have the capability to retain the selection, so
     * when using those, this property should be set to false.
     */
    resetSelectionOnHeaderClick :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResetSelectionOnHeaderClick"
    },


    /** The renderer to use for styling the rows. */
    dataRowRenderer :
    {
      check : "qx.ui.table.IRowRenderer",
      init : null,
      nullable : true,
      event : "changeDataRowRenderer"
    },


    /**
     * A function to call when before modal cell editor is opened.
     *
     * @signature function(cellEditor, cellInfo)
     *
     * @param cellEditor {qx.ui.window.Window}
     *   The modal window which has been created for this cell editor
     *
     * @param cellInfo {Map}
     *   Information about the cell for which this cell editor was created.
     *   It contains the following properties:
     *       col, row, xPos, value
     *
     * @return {void}
     */
    modalCellEditorPreOpenFunction :
    {
      check : "Function",
      init : null,
      nullable : true
    },


    /**
     * A function to instantiate a new column menu button.
     */
    newColumnMenu :
    {
      check : "Function",
      init  : function() {
        return new qx.ui.table.columnmenu.Button();
      }
    },


    /**
     * A function to instantiate a selection manager.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property must
     * be set before calling the Table constructor.
     */
    newSelectionManager :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.selection.Manager(obj);
      }
    },


    /**
     * A function to instantiate a selection model.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property must
     * be set before calling the Table constructor.
     */
    newSelectionModel :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.selection.Model(obj);
      }
    },


    /**
     * A function to instantiate a table column model.  This allows subclasses
     * of Table to subclass this internal class.  To take effect, this
     * property must be set before calling the Table constructor.
     */
    newTableColumnModel :
    {
      check : "Function",
      init : function(table) {
        return new qx.ui.table.columnmodel.Basic(table);
      }
    },


    /**
     * A function to instantiate a table pane.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property
     * must be set before calling the Table constructor.
     */
    newTablePane :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.pane.Pane(obj);
      }
    },


    /**
     * A function to instantiate a table pane.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property
     * must be set before calling the Table constructor.
     */
    newTablePaneHeader :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.pane.Header(obj);
      }
    },


    /**
     * A function to instantiate a table pane scroller.  this allows
     * subclasses of Table to subclass this internal class.  To take effect,
     * this property must be set before calling the Table constructor.
     */
    newTablePaneScroller :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.pane.Scroller(obj);
      }
    },


    /**
     * A function to instantiate a table pane model.  this allows subclasses
     * of Table to subclass this internal class.  To take effect, this
     * property must be set before calling the Table constructor.
     */
    newTablePaneModel :
    {
      check : "Function",
      init : function(columnModel) {
        return new qx.ui.table.pane.Model(columnModel);
      }
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __focusedCol : null,
    __focusedRow : null,

    __scrollerParent : null,

    __selectionManager : null,

    __additionalStatusBarText : null,
    __lastRowCount : null,
    __internalChange : null,

    __columnMenuButtons : null,
    __columnModel : null,
    __emptyTableModel : null,

    __hadVerticalScrollBar : null,

    __timer : null,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
      case "statusbar":
        control = new qx.ui.basic.Label();
        control.set(
          {
            allowGrowX: true
          });
        this._add(control);
        break;

      case "column-button":
        control = this.getNewColumnMenu()();
        control.set({
          focusable : false
        });

        // Create the initial menu too
        var menu = control.factory("menu", { table : this });

        // Add a listener to initialize the column menu when it becomes visible
        menu.addListener(
          "appear",
          this._initColumnMenu,
          this
        );

        break;
      }

      return control || this.base(arguments, id);
    },



    // property modifier
    _applySelectionModel : function(value, old)
    {
      this.__selectionManager.setSelectionModel(value);

      if (old != null) {
        old.removeListener("changeSelection", this._onSelectionChanged, this);
      }

      value.addListener("changeSelection", this._onSelectionChanged, this);
    },


    // property modifier
    _applyRowHeight : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].updateVerScrollBarMaximum();
      }
    },


    // property modifier
    _applyHeaderCellsVisible : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        if (value) {
          scrollerArr[i]._showChildControl("header");
        } else {
          scrollerArr[i]._excludeChildControl("header");
        }
      }
      // also hide the column visibility button
      if(this.getColumnVisibilityButtonVisible()) {
        this._applyColumnVisibilityButtonVisible(value);
      }
    },


    // property modifier
    _applyHeaderCellHeight : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getHeader().setHeight(value);
      }
    },


    /**
     * Get an empty table model instance to use for this table. Use this table
     * to configure the table with no table model.
     *
     * @return {qx.ui.table.ITableModel} The empty table model
     */
    getEmptyTableModel : function()
    {
      if (!this.__emptyTableModel)
      {
        this.__emptyTableModel = new qx.ui.table.model.Simple();
        this.__emptyTableModel.setColumns([]);
        this.__emptyTableModel.setData([]);
      }
      return this.__emptyTableModel;
    },


    // property modifier
    _applyTableModel : function(value, old)
    {
      this.getTableColumnModel().init(value.getColumnCount(), this);

      if (old != null)
      {
        old.removeListener(
          "metaDataChanged",
          this._onTableModelMetaDataChanged, this
        );

        old.removeListener(
          "dataChanged",
          this._onTableModelDataChanged,
          this);
      }

      value.addListener(
        "metaDataChanged",
        this._onTableModelMetaDataChanged, this
      );

      value.addListener(
        "dataChanged",
        this._onTableModelDataChanged,
        this);

      // Update the status bar
      this._updateStatusBar();

      this._updateTableData(
        0, value.getRowCount(),
        0, value.getColumnCount()
      );
      this._onTableModelMetaDataChanged();

      // If the table model has an init() method, call it. We don't, however,
      // call it if this is the initial setting of the table model, as the
      // scrollers are not yet initialized. In that case, the init method is
      // called explicitly by the Table constructor.
      if (old && value.init && typeof(value.init) == "function")
      {
        value.init(this);
      }
    },


    /**
     * Get the The table column model.
     *
     * @return {qx.ui.table.columnmodel.Basic} The table's column model
     */
    getTableColumnModel : function()
    {
      if (!this.__columnModel)
      {
        var columnModel = this.__columnModel = this.getNewTableColumnModel()(this);

        columnModel.addListener("visibilityChanged", this._onColVisibilityChanged, this);
        columnModel.addListener("widthChanged", this._onColWidthChanged, this);
        columnModel.addListener("orderChanged", this._onColOrderChanged, this);

        // Get the current table model
        var tableModel = this.getTableModel();
        columnModel.init(tableModel.getColumnCount(), this);

        // Reset the table column model in each table pane model
        var scrollerArr = this._getPaneScrollerArr();

        for (var i=0; i<scrollerArr.length; i++)
        {
          var paneScroller = scrollerArr[i];
          var paneModel = paneScroller.getTablePaneModel();
          paneModel.setTableColumnModel(columnModel);
        }
      }
      return this.__columnModel;
    },


    // property modifier
    _applyStatusBarVisible : function(value, old)
    {
      if (value) {
        this._showChildControl("statusbar");
      } else {
        this._excludeChildControl("statusbar");
      }

      if (value) {
        this._updateStatusBar();
      }
    },


    // property modifier
    _applyAdditionalStatusBarText : function(value, old)
    {
      this.__additionalStatusBarText = value;
      this._updateStatusBar();
    },


    // property modifier
    _applyColumnVisibilityButtonVisible : function(value, old)
    {
      if (value) {
        this._showChildControl("column-button");
      } else {
        this._excludeChildControl("column-button");
      }
    },


    // property modifier
    _applyMetaColumnCounts : function(value, old)
    {
      var metaColumnCounts = value;
      var scrollerArr = this._getPaneScrollerArr();
      var handlers = { };

      if (value > old)
      {
        // Save event listeners on the redirected events so we can re-apply
        // them to new scrollers.
        var manager = qx.event.Registration.getManager(scrollerArr[0]);
        for (var evName in qx.ui.table.Table.__redirectEvents)
        {
          handlers[evName] = { };
          handlers[evName].capture = manager.getListeners(scrollerArr[0],
                                                          evName,
                                                          true);
          handlers[evName].bubble = manager.getListeners(scrollerArr[0],
                                                         evName,
                                                         false);
        }
      }

      // Remove the panes not needed any more
      this._cleanUpMetaColumns(metaColumnCounts.length);

      // Update the old panes
      var leftX = 0;

      for (var i=0; i<scrollerArr.length; i++)
      {
        var paneScroller = scrollerArr[i];
        var paneModel = paneScroller.getTablePaneModel();
        paneModel.setFirstColumnX(leftX);
        paneModel.setMaxColumnCount(metaColumnCounts[i]);
        leftX += metaColumnCounts[i];
      }

      // Add the new panes
      if (metaColumnCounts.length > scrollerArr.length)
      {
        var columnModel = this.getTableColumnModel();

        for (var i=scrollerArr.length; i<metaColumnCounts.length; i++)
        {
          var paneModel = this.getNewTablePaneModel()(columnModel);
          paneModel.setFirstColumnX(leftX);
          paneModel.setMaxColumnCount(metaColumnCounts[i]);
          leftX += metaColumnCounts[i];

          var paneScroller = this.getNewTablePaneScroller()(this);
          paneScroller.setTablePaneModel(paneModel);

          // Register event listener for vertical scrolling
          paneScroller.addListener("changeScrollY", this._onScrollY, this);

          // Apply redirected events to this new scroller
          for (evName in qx.ui.table.Table.__redirectEvents)
          {
            // On first setting of meta columns (constructing phase), there
            // are no handlers to deal with yet.
            if (! handlers[evName])
            {
              break;
            }

            if (handlers[evName].capture &&
                handlers[evName].capture.length > 0)
            {
              var capture = handlers[evName].capture;
              for (var j = 0; j < capture.length; j++)
              {
                // Determine what context to use.  If the context does not
                // exist, we assume that the context is this table.  If it
                // does exist and it equals the first pane scroller (from
                // which we retrieved the listeners) then set the context
                // to be this new pane scroller.  Otherwise leave the context
                // as it was set.
                var context = capture[j].context;
                if (! context)
                {
                  context = this;
                }
                else if (context == scrollerArr[0])
                {
                  context = paneScroller;
                }

                paneScroller.addListener(
                  evName,
                  capture[j].handler,
                  context,
                  true);
              }
            }

            if (handlers[evName].bubble &&
                handlers[evName].bubble.length > 0)
            {
              var bubble = handlers[evName].bubble;
              for (var j = 0; j < bubble.length; j++)
              {
                // Determine what context to use.  If the context does not
                // exist, we assume that the context is this table.  If it
                // does exist and it equals the first pane scroller (from
                // which we retrieved the listeners) then set the context
                // to be this new pane scroller.  Otherwise leave the context
                // as it was set.
                var context = bubble[j].context;
                if (! context)
                {
                  context = this;
                }
                else if (context == scrollerArr[0])
                {
                  context = paneScroller;
                }

                paneScroller.addListener(
                  evName,
                  bubble[j].handler,
                  context,
                  false);
              }
            }
          }

          // last meta column is flexible
          var flex = (i == metaColumnCounts.length - 1) ? 1 : 0;
          this.__scrollerParent.add(paneScroller, {flex: flex});
          scrollerArr = this._getPaneScrollerArr();
        }
      }

      // Update all meta columns
      for (var i=0; i<scrollerArr.length; i++)
      {
        var paneScroller = scrollerArr[i];
        var isLast = (i == (scrollerArr.length - 1));

        // Set the right header height
        paneScroller.getHeader().setHeight(this.getHeaderCellHeight());

        // Put the column visibility button in the top right corner of the last meta column
        paneScroller.setTopRightWidget(isLast ? this.getChildControl("column-button") : null);
      }

      if (!this.isColumnVisibilityButtonVisible()) {
        this._excludeChildControl("column-button");
      }

      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    // property modifier
    _applyFocusCellOnMouseMove : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setFocusCellOnMouseMove(value);
      }
    },


    // property modifier
    _applyShowCellFocusIndicator : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setShowCellFocusIndicator(value);
      }
    },


    // property modifier
    _applyContextMenuFromDataCellsOnly : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setContextMenuFromDataCellsOnly(value);
      }
    },


    // property modifier
    _applyKeepFirstVisibleRowComplete : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onKeepFirstVisibleRowCompleteChanged();
      }
    },


    // property modifier
    _applyResetSelectionOnHeaderClick : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setResetSelectionOnHeaderClick(value);
      }
    },


    /**
     * Returns the selection manager.
     *
     * @return {qx.ui.table.selection.Manager} the selection manager.
     */
    getSelectionManager : function() {
      return this.__selectionManager;
    },


    /**
     * Returns an array containing all TablePaneScrollers in this table.
     *
     * @return {qx.ui.table.pane.Scroller[]} all TablePaneScrollers in this table.
     */
    _getPaneScrollerArr : function() {
      return this.__scrollerParent.getChildren();
    },


    /**
     * Returns a TablePaneScroller of this table.
     *
     * @param metaColumn {Integer} the meta column to get the TablePaneScroller for.
     * @return {qx.ui.table.pane.Scroller} the qx.ui.table.pane.Scroller.
     */
    getPaneScroller : function(metaColumn) {
      return this._getPaneScrollerArr()[metaColumn];
    },


    /**
     * Cleans up the meta columns.
     *
     * @param fromMetaColumn {Integer} the first meta column to clean up. All following
     *      meta columns will be cleaned up, too. All previous meta columns will
     *      stay unchanged. If 0 all meta columns will be cleaned up.
     * @return {void}
     */
    _cleanUpMetaColumns : function(fromMetaColumn)
    {
      var scrollerArr = this._getPaneScrollerArr();

      if (scrollerArr != null)
      {
        for (var i=scrollerArr.length-1; i>=fromMetaColumn; i--)
        {
          scrollerArr[i].destroy();
        }
      }
    },


    /**
     * Event handler. Called when the locale has changed.
     *
     * @param evt {Event} the event.
     * @return {void}
     */
    _onChangeLocale : function(evt)
    {
      this.updateContent();
      this._updateStatusBar();
    },


    /**
     * Event handler. Called when the selection has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onSelectionChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onSelectionChanged();
      }

      this._updateStatusBar();
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTableModelMetaDataChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onTableModelMetaDataChanged();
      }

      this._updateStatusBar();
    },


    /**
     * Event handler. Called when the table model data has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTableModelDataChanged : function(evt)
    {
      var data = evt.getData();

      this._updateTableData(
        data.firstRow, data.lastRow,
        data.firstColumn, data.lastColumn,
        data.removeStart, data.removeCount
      );
    },

    /**
     * To update the table if the table model has changed and remove selection.
     *
     * @param firstRow {Integer} The index of the first row that has changed.
     * @param lastRow {Integer} The index of the last row that has changed.
     * @param firstColumn {Integer} The model index of the first column that has changed.
     * @param lastColumn {Integer} The model index of the last column that has changed.
     * @param removeStart {Integer ? null} The first index of the interval (including), to remove selection.
     * @param removeCount {Integer ? null} The count of the interval, to remove selection.
     * @return {void}
     */
    _updateTableData : function(firstRow, lastRow, firstColumn, lastColumn, removeStart, removeCount)
    {
      var scrollerArr = this._getPaneScrollerArr();

      // update selection if rows were removed
      if (removeCount) {
        this.getSelectionModel().removeSelectionInterval(removeStart, removeStart + removeCount);
        // remove focus if the focused row has been removed
        if (this.__focusedRow >= removeStart && this.__focusedRow < (removeStart + removeCount)) {
          this.setFocusedCell();
        }
      }

      for (var i=0; i<scrollerArr.length; i++)
      {
        scrollerArr[i].onTableModelDataChanged(
          firstRow, lastRow,
          firstColumn, lastColumn
        );
      }

      var rowCount = this.getTableModel().getRowCount();

      if (rowCount != this.__lastRowCount)
      {
        this.__lastRowCount = rowCount;

        this._updateScrollBarVisibility();
        this._updateStatusBar();
      }
    },


    /**
     * Event handler. Called when a TablePaneScroller has been scrolled vertically.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onScrollY : function(evt)
    {
      if (!this.__internalChange)
      {
        this.__internalChange = true;

        // Set the same scroll position to all meta columns
        var scrollerArr = this._getPaneScrollerArr();

        for (var i=0; i<scrollerArr.length; i++) {
          scrollerArr[i].setScrollY(evt.getData());
        }

        this.__internalChange = false;
      }
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * @param evt {qx.event.type.KeySequence} the event.
     * @return {void}
     */
    _onKeyPress : function(evt)
    {
      if (!this.getEnabled()) {
        return;
      }

      // No editing mode
      var oldFocusedRow = this.__focusedRow;
      var consumed = true;

      // Handle keys that are independent from the modifiers
      var identifier = evt.getKeyIdentifier();

      if (this.isEditing())
      {
        // Editing mode
        if (evt.getModifiers() == 0)
        {
          switch(identifier)
          {
            case "Enter":
              this.stopEditing();
              var oldFocusedRow = this.__focusedRow;
              this.moveFocusedCell(0, 1);

              if (this.__focusedRow != oldFocusedRow) {
                consumed = this.startEditing();
              }

              break;

            case "Escape":
              this.cancelEditing();
              this.focus();
              break;

            default:
              consumed = false;
              break;
          }
        }

      }
      else
      {
        // No editing mode
        if (evt.isCtrlPressed())
        {
          // Handle keys that depend on modifiers
          consumed = true;

          switch(identifier)
          {
            case "A": // Ctrl + A
              var rowCount = this.getTableModel().getRowCount();

              if (rowCount > 0) {
                this.getSelectionModel().setSelectionInterval(0, rowCount - 1);
              }

              break;

            default:
              consumed = false;
              break;
          }
        }
        else
        {
          // Handle keys that are independent from the modifiers
          switch(identifier)
          {
            case "Space":
              this.__selectionManager.handleSelectKeyDown(this.__focusedRow, evt);
              break;

            case "F2":
            case "Enter":
              this.startEditing();
              consumed = true;
              break;

            case "Home":
              this.setFocusedCell(this.__focusedCol, 0, true);
              break;

            case "End":
              var rowCount = this.getTableModel().getRowCount();
              this.setFocusedCell(this.__focusedCol, rowCount - 1, true);
              break;

            case "Left":
              this.moveFocusedCell(-1, 0);
              break;

            case "Right":
              this.moveFocusedCell(1, 0);
              break;

            case "Up":
              this.moveFocusedCell(0, -1);
              break;

            case "Down":
              this.moveFocusedCell(0, 1);
              break;

            case "PageUp":
            case "PageDown":
              var scroller = this.getPaneScroller(0);
              var pane = scroller.getTablePane();
              var rowHeight = this.getRowHeight();
              var direction = (identifier == "PageUp") ? -1 : 1;
              rowCount = pane.getVisibleRowCount() - 1;
              scroller.setScrollY(scroller.getScrollY() + direction * rowCount * rowHeight);
              this.moveFocusedCell(0, direction * rowCount);
              break;

            default:
              consumed = false;
          }
        }
      }

      if (oldFocusedRow != this.__focusedRow &&
          this.getRowFocusChangeModifiesSelection())
      {
        // The focus moved -> Let the selection manager handle this event
        this.__selectionManager.handleMoveKeyDown(this.__focusedRow, evt);
      }

      if (consumed)
      {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },


    /**
     * Event handler. Called when the table gets the focus.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onFocusChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onFocusChanged();
      }
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColVisibilityChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onColVisibilityChanged();
      }

      var data = evt.getData();
      if (this.__columnMenuButtons != null && data.col != null &&
          data.visible != null) {
        this.__columnMenuButtons[data.col].setVisible(data.visible);
      }

      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    /**
     * Event handler. Called when the width of a column has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColWidthChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++)
      {
        var data = evt.getData();
        scrollerArr[i].setColumnWidth(data.col, data.newWidth);
      }

      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    /**
     * Event handler. Called when the column order has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColOrderChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onColOrderChanged();
      }

      // A column may have been moved between meta columns
      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    /**
     * Gets the TablePaneScroller at a certain x position in the page. If there is
     * no TablePaneScroller at this position, null is returned.
     *
     * @param pageX {Integer} the position in the page to check (in pixels).
     * @return {qx.ui.table.pane.Scroller} the TablePaneScroller or null.
     */
    getTablePaneScrollerAtPageX : function(pageX)
    {
      var metaCol = this._getMetaColumnAtPageX(pageX);
      return (metaCol != -1) ? this.getPaneScroller(metaCol) : null;
    },


    /**
     * Sets the currently focused cell. A value of <code>null</code> hides the
     * focus cell.
     *
     * @param col {Integer?null} the model index of the focused cell's column.
     * @param row {Integer?null} the model index of the focused cell's row.
     * @param scrollVisible {Boolean ? false} whether to scroll the new focused cell
     *          visible.
     * @return {void}
     */
    setFocusedCell : function(col, row, scrollVisible)
    {
      if (!this.isEditing() && (col != this.__focusedCol || row != this.__focusedRow))
      {
        if (col === null) {
          col = 0;
        }

        this.__focusedCol = col;
        this.__focusedRow = row;

        var scrollerArr = this._getPaneScrollerArr();

        for (var i=0; i<scrollerArr.length; i++) {
          scrollerArr[i].setFocusedCell(col, row);
        }

        if (col !== null && scrollVisible) {
          this.scrollCellVisible(col, row);
        }
      }
    },


    /**
     * Resets (clears) the current selection
     */
    resetSelection : function() {
      this.getSelectionModel().resetSelection();
    },


    /**
     * Resets the focused cell.
     */
    resetCellFocus : function() {
      this.setFocusedCell(null, null, false);
    },


    /**
     * Returns the column of the currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedColumn : function() {
      return this.__focusedCol;
    },


    /**
     * Returns the row of the currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedRow : function() {
      return this.__focusedRow;
    },


    /**
     * Select whether the focused row is highlighted
     *
     * @param bHighlight {Boolean}
     *   Flag indicating whether the focused row should be highlighted.
     *
     * @return {void}
     */
    highlightFocusedRow : function(bHighlight)
    {
      this.getDataRowRenderer().setHighlightFocusRow(bHighlight);
    },


    /**
     * Remove the highlighting of the current focus row.
     *
     * This is used to temporarily remove the highlighting of the currently
     * focused row, and is expected to be used most typically by adding a
     * listener on the "mouseout" event, so that the focus highlighting is
     * suspended when the mouse leaves the table:
     *
     *     table.addListener("mouseout", table.clearFocusedRowHighlight);
     *
     * @param evt {qx.event.type.Mouse} Incoming mouse event
     * @return {void}
     */
    clearFocusedRowHighlight : function(evt)
    {
      if(evt)
      {
        var relatedTarget = evt.getRelatedTarget();
        if (
          relatedTarget instanceof qx.ui.table.pane.Pane ||
          relatedTarget instanceof qx.ui.table.pane.FocusIndicator
         ) {
           return ;
         }
      }

      // Remove focus from any cell that has it
      this.resetCellFocus();

      // Now, for each pane scroller...
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++)
      {
        // ... repaint without focus.
        scrollerArr[i].onFocusChanged();
      }
    },


    /**
     * Moves the focus.
     *
     * @param deltaX {Integer} The delta by which the focus should be moved on the x axis.
     * @param deltaY {Integer} The delta by which the focus should be moved on the y axis.
     * @return {void}
     */
    moveFocusedCell : function(deltaX, deltaY)
    {
      var col = this.__focusedCol;
      var row = this.__focusedRow;

      // could also be undefined [BUG #4676]
      if (col == null || row == null) {
        return;
      }

      if (deltaX != 0)
      {
        var columnModel = this.getTableColumnModel();
        var x = columnModel.getVisibleX(col);
        var colCount = columnModel.getVisibleColumnCount();
        x = qx.lang.Number.limit(x + deltaX, 0, colCount - 1);
        col = columnModel.getVisibleColumnAtX(x);
      }

      if (deltaY != 0)
      {
        var tableModel = this.getTableModel();
        row = qx.lang.Number.limit(row + deltaY, 0, tableModel.getRowCount() - 1);
      }

      this.setFocusedCell(col, row, true);
    },


    /**
     * Scrolls a cell visible.
     *
     * @param col {Integer} the model index of the column the cell belongs to.
     * @param row {Integer} the model index of the row the cell belongs to.
     * @return {void}
     */
    scrollCellVisible : function(col, row)
    {
      // get the dom element
      var elem = this.getContentElement().getDomElement();
      // if the dom element is not available, the table hasn't been rendered
      if (!elem) {
        // postpone the scroll until the table has appeared
        this.addListenerOnce("appear", function() {
          this.scrollCellVisible(col, row);
        }, this);
      }

      var columnModel = this.getTableColumnModel();
      var x = columnModel.getVisibleX(col);

      var metaColumn = this._getMetaColumnAtColumnX(x);

      if (metaColumn != -1) {
        this.getPaneScroller(metaColumn).scrollCellVisible(col, row);
      }
    },


    /**
     * Returns whether currently a cell is editing.
     *
     * @return {var} whether currently a cell is editing.
     */
    isEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        return this.getPaneScroller(metaColumn).isEditing();
      }
      return false;
    },


    /**
     * Starts editing the currently focused cell. Does nothing if already editing
     * or if the column is not editable.
     *
     * @return {Boolean} whether editing was started
     */
    startEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        var started = this.getPaneScroller(metaColumn).startEditing();
        return started;
      }

      return false;
    },


    /**
     * Stops editing and writes the editor's value to the model.
     */
    stopEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        this.getPaneScroller(metaColumn).stopEditing();
      }
    },


    /**
     * Stops editing without writing the editor's value to the model.
     */
    cancelEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        this.getPaneScroller(metaColumn).cancelEditing();
      }
    },


    /**
     * Update the table content of every attached table pane.
     */
    updateContent : function() {
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getTablePane().updateContent(true);
      }
    },

    /**
     * Activates the blocker widgets on all column headers and the
     * column button
     */
    blockHeaderElements : function()
    {
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getHeader().getBlocker().blockContent(20);
      }
      this.getChildControl("column-button").getBlocker().blockContent(20);
    },


    /**
     * Deactivates the blocker widgets on all column headers and the
     * column button
     */
    unblockHeaderElements : function()
    {
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getHeader().getBlocker().unblockContent();
      }
      this.getChildControl("column-button").getBlocker().unblockContent();
    },

    /**
     * Gets the meta column at a certain x position in the page. If there is no
     * meta column at this position, -1 is returned.
     *
     * @param pageX {Integer} the position in the page to check (in pixels).
     * @return {Integer} the index of the meta column or -1.
     */
    _getMetaColumnAtPageX : function(pageX)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++)
      {
        var pos = scrollerArr[i].getContainerLocation();

        if (pageX >= pos.left && pageX <= pos.right) {
          return i;
        }
      }

      return -1;
    },


    /**
     * Returns the meta column a column is shown in. If the column is not shown at
     * all, -1 is returned.
     *
     * @param visXPos {Integer} the visible x position of the column.
     * @return {Integer} the meta column the column is shown in.
     */
    _getMetaColumnAtColumnX : function(visXPos)
    {
      var metaColumnCounts = this.getMetaColumnCounts();
      var rightXPos = 0;

      for (var i=0; i<metaColumnCounts.length; i++)
      {
        var counts = metaColumnCounts[i];
        rightXPos += counts;

        if (counts == -1 || visXPos < rightXPos) {
          return i;
        }
      }

      return -1;
    },


    /**
     * Updates the text shown in the status bar.
     */
    _updateStatusBar : function()
    {
      var tableModel = this.getTableModel();

      if (this.getStatusBarVisible())
      {
        var selectedRowCount = this.getSelectionModel().getSelectedCount();
        var rowCount = tableModel.getRowCount();

        var text;

        if (rowCount >= 0)
        {
          if (selectedRowCount == 0) {
            text = this.trn("one row", "%1 rows", rowCount, rowCount);
          } else {
            text = this.trn("one of one row", "%1 of %2 rows", rowCount, selectedRowCount, rowCount);
          }
        }

        if (this.__additionalStatusBarText)
        {
          if (text) {
            text += this.__additionalStatusBarText;
          } else {
            text = this.__additionalStatusBarText;
          }
        }

        if (text) {
          this.getChildControl("statusbar").setValue(text);
        }
      }
    },


    /**
     * Updates the widths of all scrollers.
     */
    _updateScrollerWidths : function()
    {
      // Give all scrollers except for the last one the wanted width
      // (The last one has a flex with)
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++)
      {
        var isLast = (i == (scrollerArr.length - 1));
        var width = scrollerArr[i].getTablePaneModel().getTotalWidth();
        scrollerArr[i].setPaneWidth(width);

        var flex = isLast ? 1 : 0;
        scrollerArr[i].setLayoutProperties({flex: flex});
      }
    },


    /**
     * Updates the visibility of the scrollbars in the meta columns.
     */
    _updateScrollBarVisibility : function()
    {
      if (!this.getBounds()) {
        return;
      }

      var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
      var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;
      var scrollerArr = this._getPaneScrollerArr();

      // Check which scroll bars are needed
      var horNeeded = false;
      var verNeeded = false;

      for (var i=0; i<scrollerArr.length; i++)
      {
        var isLast = (i == (scrollerArr.length - 1));

        // Only show the last vertical scrollbar
        var bars = scrollerArr[i].getNeededScrollBars(horNeeded, !isLast);

        if (bars & horBar) {
          horNeeded = true;
        }

        if (isLast && (bars & verBar)) {
          verNeeded = true;
        }
      }

      // Set the needed scrollbars
      for (var i=0; i<scrollerArr.length; i++)
      {
        var isLast = (i == (scrollerArr.length - 1));

        // Only show the last vertical scrollbar
        scrollerArr[i].setHorizontalScrollBarVisible(horNeeded);

        // If this is the last meta-column...
        if (isLast)
        {
          // ... then get the current (old) use of vertical scroll bar
          if (this.__hadVerticalScrollBar == null) {
            this.__hadVerticalScrollBar = scrollerArr[i].getVerticalScrollBarVisible();
            this.__timer = qx.event.Timer.once(function()
            {
              // reset the last visible state of the vertical scroll bar
              // in a timeout to prevent infinite loops.
              this.__hadVerticalScrollBar = null;
              this.__timer = null;
            }, this, 0);
          }
        }

        scrollerArr[i].setVerticalScrollBarVisible(isLast && verNeeded);

        // If this is the last meta-column and the use of a vertical scroll bar
        // has changed...
        if (isLast && verNeeded != this.__hadVerticalScrollBar)
        {
          // ... then dispatch an event to any awaiting listeners
          this.fireDataEvent("verticalScrollBarChanged", verNeeded);
        }
      }
    },


    /**
     * Initialize the column menu
     */
    _initColumnMenu : function()
    {
      var tableModel = this.getTableModel();
      var columnModel = this.getTableColumnModel();

      var columnButton = this.getChildControl("column-button");

      // Remove all items from the menu. We'll rebuild it here.
      columnButton.empty();

      // Inform listeners who may want to insert menu items at the beginning
      var menu = columnButton.getMenu();
      var data =
      {
        table        : this,
        menu         : menu,
        columnButton : columnButton
      };
      this.fireDataEvent("columnVisibilityMenuCreateStart", data);

      this.__columnMenuButtons = {};
      for (var col=0, l=tableModel.getColumnCount(); col<l; col++)
      {
        var menuButton =
          columnButton.factory("menu-button",
                               {
                                 text     : tableModel.getColumnName(col),
                                 column   : col,
                                 bVisible : columnModel.isColumnVisible(col)
                               });

        qx.core.Assert.assertInterface(menuButton,
                                       qx.ui.table.IColumnMenuItem);

        menuButton.addListener(
          "changeVisible",
          this._createColumnVisibilityCheckBoxHandler(col), this);
        this.__columnMenuButtons[col] = menuButton;
      }

      // Inform listeners who may want to insert menu items at the end
      data =
      {
        table        : this,
        menu         : menu,
        columnButton : columnButton
      };
      this.fireDataEvent("columnVisibilityMenuCreateEnd", data);
    },





    /**
     * Creates a handler for a check box of the column visibility menu.
     *
     * @param col {Integer} the model index of column to create the handler for.
     * @return {Function} The created event handler.
     */
    _createColumnVisibilityCheckBoxHandler : function(col)
    {
      return function(evt)
      {
        var columnModel = this.getTableColumnModel();
        columnModel.setColumnVisible(col, evt.getData());
      };
    },


    /**
     * Sets the width of a column.
     *
     * @param col {Integer} the model index of column.
     * @param width {Integer} the new width in pixels.
     * @return {void}
     */
    setColumnWidth : function(col, width) {
      this.getTableColumnModel().setColumnWidth(col, width);
    },


    /**
     * Resize event handler
     */
    _onResize : function()
    {
      this.fireEvent("tableWidthChanged");
      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    // overridden
    addListener : function(type, listener, self, capture)
    {
      if (this.self(arguments).__redirectEvents[type])
      {
        // start the id with the type (needed for removing)
        var id = [type];
        for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++)
        {
          id.push(arr[i].addListener.apply(arr[i], arguments));
        }
        // join the id's of every event with "
        return id.join('"');
      }
      else
      {
        return this.base(arguments, type, listener, self, capture);
      }
    },


    // overridden
    removeListener : function(type, listener, self, capture)
    {
      if (this.self(arguments).__redirectEvents[type])
      {
        for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++)
        {
          arr[i].removeListener.apply(arr[i], arguments);
        }
      }
      else
      {
        this.base(arguments, type, listener, self, capture);
      }
    },


    // overridden
    removeListenerById : function(id) {
      var ids = id.split('"');
      // type is the first entry of the connected id
      var type = ids.shift();
      if (this.self(arguments).__redirectEvents[type])
      {
        var removed = true;
        for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++)
        {
          removed = arr[i].removeListenerById.call(arr[i], ids[i]) && removed;
        }
        return removed;
      }
      else
      {
        return this.base(arguments, id);
      }
    },


    destroy : function()
    {
      this.getChildControl("column-button").getMenu().destroy();
      this.base(arguments);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // remove the event listener which handled the locale change
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }

    // we allocated these objects on init so we have to clean them up.
    var selectionModel = this.getSelectionModel();
    if (selectionModel) {
      selectionModel.dispose();
    }

    var dataRowRenderer = this.getDataRowRenderer();
    if (dataRowRenderer) {
      dataRowRenderer.dispose();
    }

    this._cleanUpMetaColumns(0);
    this.getTableColumnModel().dispose();
    this._disposeObjects(
      "__selectionManager", "__scrollerParent",
      "__emptyTableModel", "__emptyTableModel",
      "__columnModel", "__timer"
    );
    this._disposeMap("__columnMenuButtons");
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

************************************************************************ */

/**
 * Interface for a row renderer.
 */
qx.Interface.define("qx.ui.table.IRowRenderer",
{
  members :
  {
    /**
     * Updates a data row.
     *
     * The rowInfo map contains the following properties:
     * <ul>
     * <li>rowData (var): contains the row data for the row.
     *   The kind of this object depends on the table model, see
     *   {@link ITableModel#getRowData()}</li>
     * <li>row (int): the model index of the row.</li>
     * <li>selected (boolean): whether a cell in this row is selected.</li>
     * <li>focusedRow (boolean): whether the focused cell is in this row.</li>
     * <li>table (qx.ui.table.Table): the table the row belongs to.</li>
     * </ul>
     *
     * @abstract
     * @param rowInfo {Map} A map containing the information about the row to
     *      update.
     * @param rowElement {element} the DOM element that renders the data row.
     */
    updateDataRowElement : function(rowInfo, rowElement) {},


    /**
     * Get the row's height CSS style taking the box model into account
     *
     * @param height {Integer} The row's (border-box) height in pixel
     */
    getRowHeightStyle : function(height) {},


    /**
     * Create a style string, which will be set as the style property of the row.
     *
     * @param rowInfo {Map} A map containing the information about the row to
     *      update. See {@link #updateDataRowElement} for more information.
     */
    createRowStyle : function(rowInfo) {},


    /**
     * Create a HTML class string, which will be set as the class property of the row.
     *
     * @param rowInfo {Map} A map containing the information about the row to
     *      update. See {@link #updateDataRowElement} for more information.
     */
    getRowClass : function(rowInfo) {}

  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2007 Visionet GmbH, http://www.visionet.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132) STZ-IDA
     * Dietrich Streifert (level420) Visionet

************************************************************************ */

/**
 * The default data row renderer.
 */
qx.Class.define("qx.ui.table.rowrenderer.Default",
{
  extend : qx.core.Object,
  implement : qx.ui.table.IRowRenderer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__fontStyleString = "";
    this.__fontStyleString = {};

    this._colors = {};

    // link to font theme
    this._renderFont(qx.theme.manager.Font.getInstance().resolve("default"));

    // link to color theme
    var colorMgr = qx.theme.manager.Color.getInstance();
    this._colors.bgcolFocusedSelected = colorMgr.resolve("table-row-background-focused-selected");
    this._colors.bgcolFocused = colorMgr.resolve("table-row-background-focused");
    this._colors.bgcolSelected = colorMgr.resolve("table-row-background-selected");
    this._colors.bgcolEven = colorMgr.resolve("table-row-background-even");
    this._colors.bgcolOdd = colorMgr.resolve("table-row-background-odd");
    this._colors.colSelected = colorMgr.resolve("table-row-selected");
    this._colors.colNormal = colorMgr.resolve("table-row");
    this._colors.horLine = colorMgr.resolve("table-row-line");
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the focused row should be highlighted. */
    highlightFocusRow :
    {
      check : "Boolean",
      init : true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _colors : null,
    __fontStyle : null,
    __fontStyleString : null,


    /**
     * the sum of the vertical insets. This is needed to compute the box model
     * independent size
     */
    _insetY : 1, // borderBottom

    /**
     * Render the new font and update the table pane content
     * to reflect the font change.
     *
     * @param font {qx.bom.Font} The font to use for the table row
     */
    _renderFont : function(font)
    {
      if (font)
      {
        this.__fontStyle = font.getStyles();
        this.__fontStyleString = qx.bom.element.Style.compile(this.__fontStyle);
        this.__fontStyleString = this.__fontStyleString.replace(/"/g, "'");
      }
      else
      {
        this.__fontStyleString = "";
        this.__fontStyle = qx.bom.Font.getDefaultStyles();
      }
    },


    // interface implementation
    updateDataRowElement : function(rowInfo, rowElem)
    {
      var fontStyle = this.__fontStyle;
      var style = rowElem.style;

      // set font styles
      qx.bom.element.Style.setStyles(rowElem, fontStyle);

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        style.backgroundColor = rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused;
      }
      else
      {
        if (rowInfo.selected)
        {
          style.backgroundColor = this._colors.bgcolSelected;
        }
        else
        {
          style.backgroundColor = (rowInfo.row % 2 == 0) ? this._colors.bgcolEven : this._colors.bgcolOdd;
        }
      }

      style.color = rowInfo.selected ? this._colors.colSelected : this._colors.colNormal;
      style.borderBottom = "1px solid " + this._colors.horLine;
    },


    /**
     * Get the row's height CSS style taking the box model into account
     *
     * @param height {Integer} The row's (border-box) height in pixel
     */
    getRowHeightStyle : function(height)
    {
      if (qx.core.Environment.get("css.boxmodel") == "content") {
        height -= this._insetY;
      }

      return "height:" + height + "px;";
    },


    // interface implementation
    createRowStyle : function(rowInfo)
    {
      var rowStyle = [];
      rowStyle.push(";");
      rowStyle.push(this.__fontStyleString);
      rowStyle.push("background-color:");

      if (rowInfo.focusedRow && this.getHighlightFocusRow())
      {
        rowStyle.push(rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused);
      }
      else
      {
        if (rowInfo.selected)
        {
          rowStyle.push(this._colors.bgcolSelected);
        }
        else
        {
          rowStyle.push((rowInfo.row % 2 == 0) ? this._colors.bgcolEven : this._colors.bgcolOdd);
        }
      }

      rowStyle.push(';color:');
      rowStyle.push(rowInfo.selected ? this._colors.colSelected : this._colors.colNormal);

      rowStyle.push(';border-bottom: 1px solid ', this._colors.horLine);

      return rowStyle.join("");
    },


    getRowClass : function(rowInfo) {
      return "";
    },

    /**
     * Add extra attributes to each row.
     *
     * @param rowInfo {Object}
     *   The following members are available in rowInfo:
     *   <dl>
     *     <dt>table {qx.ui.table.Table}</dt>
     *     <dd>The table object</dd>
     *
     *     <dt>styleHeight {Integer}</dt>
     *     <dd>The height of this (and every) row</dd>
     *
     *     <dt>row {Integer}</dt>
     *     <dd>The number of the row being added</dd>
     *
     *     <dt>selected {Boolean}</dt>
     *     <dd>Whether the row being added is currently selected</dd>
     *
     *     <dt>focusedRow {Boolean}</dt>
     *     <dd>Whether the row being added is currently focused</dd>
     *
     *     <dt>rowData {Array}</dt>
     *     <dd>The array row from the data model of the row being added</dd>
     *   </dl>
     *
     * @return {String}
     *   Any additional attributes and their values that should be added to the
     *   div tag for the row.
     */
    getRowAttributes : function(rowInfo)
    {
      return "";
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._colors = this.__fontStyle = this.__fontStyleString = null;
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Interface for creating the column visibility menu
 */
qx.Interface.define("qx.ui.table.IColumnMenuButton",
{
  properties :
  {
    /**
     * The menu which is displayed when this button is pressed.
     */
    menu : { }
  },

  members :
  {
    /**
     * Instantiate a sub-widget.
     *
     * @param item {String}
     *   One of the following strings, indicating what type of
     *   column-menu-specific object to instantiate:
     *   <dl>
     *     <dt>menu</dt>
     *     <dd>
     *       Instantiate a menu which will appear when the column visibility
     *       button is pressed. No options are provided in this case.
     *     </dd>
     *     <dt>menu-button</dt>
     *     <dd>
     *       Instantiate a button to correspond to a column within the
     *       table. The options are a map containing <i>text</i>, the name of
     *       the column; <i>column</i>, the column number; and
     *       <i>bVisible</i>, a boolean indicating whether this column is
     *       currently visible. The instantiated return object must implement
     *       interface {@link qx.ui.table.IColumnMenuItem}
     *     </dd>
     *     <dt>user-button</dt>
     *     <dd>
     *       Instantiate a button for other than a column name. This is used,
     *       for example, to add the "Reset column widths" button when the
     *       Resize column model is requested. The options is a map containing
     *       <i>text</i>, the text to present in the button.
     *     </dd>
     *     <dt>separator</dt>
     *     <dd>
     *       Instantiate a separator object to added to the menu. This is
     *       used, for example, to separate the table column name list from
     *       the "Reset column widths" button when the Resize column model is
     *       requested. No options are provided in this case.
     *     </dd>
     *   </dl>
     *
     * @param options {Map}
     *   Options specific to the <i>item</i> being requested.
     *
     * @return {qx.ui.core.Widget}
     *   The instantiated object as specified by <i>item</i>.
     */
    factory : function(item, options)
    {
      return true;
    },

    /**
     * Empty the menu of all items, in preparation for building a new column
     * visibility menu.
     *
     * @return {void}
     */
    empty : function()
    {
      return true;
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
 * A button which opens the connected menu when clicking on it.
 */
qx.Class.define("qx.ui.form.MenuButton",
{
  extend : qx.ui.form.Button,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param icon {String?null} Initial icon
   * @param menu {qx.ui.menu.Menu} Connect to menu instance
   */
  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon);

    // Initialize properties
    if (menu != null) {
      this.setMenu(menu);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The menu instance to show when clicking on the button */
    menu :
    {
      check : "qx.ui.menu.Menu",
      nullable : true,
      apply : "_applyMenu",
      event : "changeMenu"
    }
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
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // overridden
    _applyVisibility : function(value, old) {
      this.base(arguments, value, old);

      // hide the menu too
      var menu = this.getMenu();
      if (value != "visible" && menu) {
        menu.hide();
      }
    },


    // property apply
    _applyMenu : function(value, old)
    {
      if (old)
      {
        old.removeListener("changeVisibility", this._onMenuChange, this);
        old.resetOpener();
      }

      if (value)
      {
        value.addListener("changeVisibility", this._onMenuChange, this);
        value.setOpener(this);

        value.removeState("submenu");
        value.removeState("contextmenu");
      }
    },




    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Positions and shows the attached menu widget.
     *
     * @param selectFirst {Boolean?false} Whether the first menu button should be selected
     */
    open : function(selectFirst)
    {
      var menu = this.getMenu();

      if (menu)
      {
        // Hide all menus first
        qx.ui.menu.Manager.getInstance().hideAll();

        // Open the attached menu
        menu.setOpener(this);
        menu.open();

        // Select first item
        if (selectFirst)
        {
          var first = menu.getSelectables()[0];
          if (first) {
            menu.setSelectedButton(first);
          }
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange : function(e)
    {
      var menu = this.getMenu();

      if (menu.isVisible()) {
        this.addState("pressed");
      } else {
        this.removeState("pressed");
      }
    },


    // overridden
    _onMouseDown : function(e)
    {
      // call the base function to get into the capture phase [BUG #4340]
      this.base(arguments, e);

      // only open on left clicks [BUG #5125]
      if(e.getButton() != "left") {
        return;
      }

      var menu = this.getMenu();
      if (menu)
      {
        // Toggle sub menu visibility
        if (!menu.isVisible()) {
          this.open();
        } else {
          menu.exclude();
        }

        // Event is processed, stop it for others
        e.stopPropagation();
      }
    },


    // overridden
    _onMouseUp : function(e)
    {
      // call base for firing the execute event
      this.base(arguments, e);

      // Just stop propagation to stop menu manager
      // from getting the event
      e.stopPropagation();
    },


    // overridden
    _onMouseOver : function(e)
    {
      // Add hovered state
      this.addState("hovered");
    },


    // overridden
    _onMouseOut : function(e)
    {
      // Just remove the hover state
      this.removeState("hovered");
    },


    // overridden
    _onKeyDown : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
          this.removeState("abandoned");
          this.addState("pressed");

          var menu = this.getMenu();
          if (menu)
          {
            // Toggle sub menu visibility
            if (!menu.isVisible()) {
              this.open();
            } else {
              menu.exclude();
            }
          }

          e.stopPropagation();
      }
    },


    // overridden
    _onKeyUp : function(e) {
      // no action required here
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
 * This singleton manages visible menu instances and supports some
 * core features to schedule menu open/close with timeout support.
 *
 * It also manages the whole keyboard support for the currently
 * registered widgets.
 *
 * The zIndex order is also managed by this class.
 */
qx.Class.define("qx.ui.menu.Manager",
{
  type : "singleton",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create data structure
    this.__objects = [];

    var el = document.body;
    var Registration = qx.event.Registration;

    // React on mousedown/mouseup events, but on native, to support inline applications
    Registration.addListener(window.document.documentElement, "mousedown", this._onMouseDown, this, true);

    // React on keypress events
    Registration.addListener(el, "keydown", this._onKeyUpDown, this, true);
    Registration.addListener(el, "keyup", this._onKeyUpDown, this, true);
    Registration.addListener(el, "keypress", this._onKeyPress, this, true);

    // only use the blur event to hide windows on non touch devices [BUG #4033]
    // When the menu is locaed on top of an iFrame, the select will fail
    if (!qx.core.Environment.get("event.touch")) {
      // Hide all when the window is blurred
      qx.bom.Element.addListener(window, "blur", this.hideAll, this);
    }

    // Create open timer
    this.__openTimer = new qx.event.Timer;
    this.__openTimer.addListener("interval", this._onOpenInterval, this);

    // Create close timer
    this.__closeTimer = new qx.event.Timer;
    this.__closeTimer.addListener("interval", this._onCloseInterval, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __scheduleOpen : null,
    __scheduleClose : null,
    __openTimer : null,
    __closeTimer : null,
    __objects : null,




    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Query engine for menu children.
     *
     * @param menu {qx.ui.menu.Menu} Any menu instance
     * @param start {Integer} Child index to start with
     * @param iter {Integer} Iteration count, normally <code>+1</code> or <code>-1</code>
     * @param loop {Boolean?false} Whether to wrap when reaching the begin/end of the list
     * @return {qx.ui.menu.Button} Any menu button or <code>null</code>
     */
    _getChild : function(menu, start, iter, loop)
    {
      var children = menu.getChildren();
      var length = children.length;
      var child;

      for (var i=start; i<length && i>=0; i+=iter)
      {
        child = children[i];
        if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
          return child;
        }
      }

      if (loop)
      {
        i = i == length ? 0 : length-1;
        for (; i!=start; i+=iter)
        {
          child = children[i];
          if (child.isEnabled() && !child.isAnonymous() && child.isVisible()) {
            return child;
          }
        }
      }

      return null;
    },


    /**
     * Whether the given widget is inside any Menu instance.
     *
     * @param widget {qx.ui.core.Widget} Any widget
     * @return {Boolean} <code>true</code> when the widget is part of any menu
     */
    _isInMenu : function(widget)
    {
      while(widget)
      {
        if (widget instanceof qx.ui.menu.Menu) {
          return true;
        }

        widget = widget.getLayoutParent();
      }

      return false;
    },


    /**
     * Returns an instance of a menu button if the given widget is a child
     *
     * @param widget {qx.ui.core.Widget} any widget
     * @return {qx.ui.menu.Button} Any menu button instance or <code>null</code>
     */
    _getMenuButton : function(widget)
    {
      while(widget)
      {
        if (widget instanceof qx.ui.menu.AbstractButton) {
          return widget;
        }

        widget = widget.getLayoutParent();
      }

      return null;
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a menu to the list of visible menus.
     *
     * @param obj {qx.ui.menu.Menu} Any menu instance.
     */
    add : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var reg = this.__objects;
      reg.push(obj);
      obj.setZIndex(1e6+reg.length);
    },


    /**
     * Remove a menu from the list of visible menus.
     *
     * @param obj {qx.ui.menu.Menu} Any menu instance.
     */
    remove : function(obj)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!(obj instanceof qx.ui.menu.Menu)) {
          throw new Error("Object is no menu: " + obj);
        }
      }

      var reg = this.__objects;
      if (reg) {
        qx.lang.Array.remove(reg, obj);
      }
    },


    /**
     * Hides all currently opened menus.
     */
    hideAll : function()
    {
      var reg = this.__objects;
      if (reg)
      {
        for (var i=reg.length-1; i>=0; i--) {
          reg[i].exclude();
        }
      }
    },


    /**
     * Returns the menu which was opened at last (which
     * is the active one this way)
     *
     * @return {qx.ui.menu.Menu} The current active menu or <code>null</code>
     */
    getActiveMenu : function()
    {
      var reg = this.__objects;
      return reg.length > 0 ? reg[reg.length-1] : null;
    },




    /*
    ---------------------------------------------------------------------------
      SCHEDULED OPEN/CLOSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Schedules the given menu to be opened after the
     * {@link qx.ui.menu.Menu#openInterval} configured by the
     * menu instance itself.
     *
     * @param menu {qx.ui.menu.Menu} The menu to schedule for open
     */
    scheduleOpen : function(menu)
    {
      // Cancel close of given menu first
      this.cancelClose(menu);

      // When the menu is already visible
      if (menu.isVisible())
      {
        // Cancel all other open requests
        if (this.__scheduleOpen) {
          this.cancelOpen(this.__scheduleOpen);
        }
      }

      // When the menu is not visible and not scheduled already
      // then schedule it for opening
      else if (this.__scheduleOpen != menu)
      {
        // menu.debug("Schedule open");
        this.__scheduleOpen = menu;
        this.__openTimer.restartWith(menu.getOpenInterval());
      }
    },


    /**
     * Schedules the given menu to be closed after the
     * {@link qx.ui.menu.Menu#closeInterval} configured by the
     * menu instance itself.
     *
     * @param menu {qx.ui.menu.Menu} The menu to schedule for close
     */
    scheduleClose : function(menu)
    {
      // Cancel open of the menu first
      this.cancelOpen(menu);

      // When the menu is already invisible
      if (!menu.isVisible())
      {
        // Cancel all other close requests
        if (this.__scheduleClose) {
          this.cancelClose(this.__scheduleClose);
        }
      }

      // When the menu is visible and not scheduled already
      // then schedule it for closing
      else if (this.__scheduleClose != menu)
      {
        // menu.debug("Schedule close");
        this.__scheduleClose = menu;
        this.__closeTimer.restartWith(menu.getCloseInterval());
      }
    },


    /**
     * When the given menu is scheduled for open this pending
     * request is canceled.
     *
     * @param menu {qx.ui.menu.Menu} The menu to cancel for open
     */
    cancelOpen : function(menu)
    {
      if (this.__scheduleOpen == menu)
      {
        // menu.debug("Cancel open");
        this.__openTimer.stop();
        this.__scheduleOpen = null;
      }
    },


    /**
     * When the given menu is scheduled for close this pending
     * request is canceled.
     *
     * @param menu {qx.ui.menu.Menu} The menu to cancel for close
     */
    cancelClose : function(menu)
    {
      if (this.__scheduleClose == menu)
      {
        // menu.debug("Cancel close");
        this.__closeTimer.stop();
        this.__scheduleClose = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      TIMER EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for a pending open request. Configured to the interval
     * of the current menu to open.
     *
     * @param e {qx.event.type.Event} Interval event
     */
    _onOpenInterval : function(e)
    {
      // Stop timer
      this.__openTimer.stop();

      // Open menu and reset flag
      this.__scheduleOpen.open();
      this.__scheduleOpen = null;
    },


    /**
     * Event listener for a pending close request. Configured to the interval
     * of the current menu to close.
     *
     * @param e {qx.event.type.Event} Interval event
     */
    _onCloseInterval : function(e)
    {
      // Stop timer, reset scheduling flag
      this.__closeTimer.stop();

      // Close menu and reset flag
      this.__scheduleClose.exclude();
      this.__scheduleClose = null;
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for mousedown events
     *
     * @param e {qx.event.type.Mouse} mousedown event
     */
    _onMouseDown : function(e)
    {
      var target = e.getTarget();
      target = qx.ui.core.Widget.getWidgetByElement(target, true);

      // If the target is 'null' the click appears on a DOM element witch is not
      // a widget. This happens normally with an inline application, when the user
      // clicks not in the inline application. In this case all all currently
      // open menus should be closed.
      if (target == null) {
        this.hideAll();
        return;
      }

      // If the target is the one which has opened the current menu
      // we ignore the mousedown to let the button process the event
      // further with toggling or ignoring the click.
      if (target.getMenu && target.getMenu() && target.getMenu().isVisible()) {
        return;
      }

      // All clicks not inside a menu will hide all currently open menus
      if (this.__objects.length > 0 && !this._isInMenu(target)) {
        this.hideAll();
      }
    },


    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * {Map} Map of all keys working on an active menu selection
     * @lint ignoreReferenceField(__selectionKeys)
     */
    __selectionKeys :
    {
      "Enter" : 1,
      "Space" : 1
    },


    /**
     * {Map} Map of all keys working without a selection
     * @lint ignoreReferenceField(__navigationKeys)
     */
    __navigationKeys :
    {
      "Escape" : 1,
      "Up" : 1,
      "Down" : 1,
      "Left" : 1,
      "Right" : 1
    },


    /**
     * Event handler for all keyup/keydown events. Stops all events
     * when any menu is opened.
     *
     * @param e {qx.event.type.KeySequence} Keyboard event
     * @return {void}
     */
    _onKeyUpDown : function(e)
    {
      var menu = this.getActiveMenu();
      if (!menu) {
        return;
      }

      // Stop for all supported key combos
      var iden = e.getKeyIdentifier();
      if (this.__navigationKeys[iden] || (this.__selectionKeys[iden] && menu.getSelectedButton())) {
        e.stopPropagation();
      }
    },


    /**
     * Event handler for all keypress events. Delegates the event to the more
     * specific methods defined in this class.
     *
     * Currently processes the keys: <code>Up</code>, <code>Down</code>,
     * <code>Left</code>, <code>Right</code> and <code>Enter</code>.
     *
     * @param e {qx.event.type.KeySequence} Keyboard event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      var menu = this.getActiveMenu();
      if (!menu) {
        return;
      }

      var iden = e.getKeyIdentifier();
      var navigation = this.__navigationKeys[iden];
      var selection = this.__selectionKeys[iden];

      if (navigation)
      {
        switch(iden)
        {
          case "Up":
            this._onKeyPressUp(menu);
            break;

          case "Down":
            this._onKeyPressDown(menu);
            break;

          case "Left":
            this._onKeyPressLeft(menu);
            break;

          case "Right":
            this._onKeyPressRight(menu);
            break;

          case "Escape":
            this.hideAll();
            break;
        }

        e.stopPropagation();
        e.preventDefault();
      }
      else if (selection)
      {
        // Do not process these events when no item is hovered
        var button = menu.getSelectedButton();
        if (button)
        {
          switch(iden)
          {
            case "Enter":
              this._onKeyPressEnter(menu, button, e);
              break;

            case "Space":
              this._onKeyPressSpace(menu, button, e);
              break;
          }

          e.stopPropagation();
          e.preventDefault();
        }
      }
    },


    /**
     * Event handler for <code>Up</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @return {void}
     */
    _onKeyPressUp : function(menu)
    {
      // Query for previous child
      var selectedButton = menu.getSelectedButton();
      var children = menu.getChildren();
      var start = selectedButton ? menu.indexOf(selectedButton)-1 : children.length-1;
      var nextItem = this._getChild(menu, start, -1, true);

      // Reconfigure property
      if (nextItem) {
        menu.setSelectedButton(nextItem);
      } else {
        menu.resetSelectedButton();
      }
    },


    /**
     * Event handler for <code>Down</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @return {void}
     */
    _onKeyPressDown : function(menu)
    {
      // Query for next child
      var selectedButton = menu.getSelectedButton();
      var start = selectedButton ? menu.indexOf(selectedButton)+1 : 0;
      var nextItem = this._getChild(menu, start, 1, true);

      // Reconfigure property
      if (nextItem) {
        menu.setSelectedButton(nextItem);
      } else {
        menu.resetSelectedButton();
      }
    },


    /**
     * Event handler for <code>Left</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @return {void}
     */
    _onKeyPressLeft : function(menu)
    {
      var menuOpener = menu.getOpener();
      if (!menuOpener) {
        return;
      }

      // Back to the "parent" menu
      if (menuOpener instanceof qx.ui.menu.AbstractButton)
      {
        var parentMenu = menuOpener.getLayoutParent();

        parentMenu.resetOpenedButton();
        parentMenu.setSelectedButton(menuOpener);
      }

      // Goto the previous toolbar button
      else if (menuOpener instanceof qx.ui.menubar.Button)
      {
        var buttons = menuOpener.getMenuBar().getMenuButtons();
        var index = buttons.indexOf(menuOpener);

        // This should not happen, definitely!
        if (index === -1) {
          return;
        }

        // Get previous button, fallback to end if first arrived
        var prevButton = null;
        var length =  buttons.length;
        for (var i = 1; i <= length; i++)
        {
          var button = buttons[(index - i + length) % length];
          if(button.isEnabled() && button.isVisible()) {
            prevButton = button;
            break;
          }
        }

        if (prevButton && prevButton != menuOpener) {
          prevButton.open(true);
        }
      }
    },


    /**
     * Event handler for <code>Right</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @return {void}
     */
    _onKeyPressRight : function(menu)
    {
      var selectedButton = menu.getSelectedButton();

      // Open sub-menu of hovered item and select first child
      if (selectedButton)
      {
        var subMenu = selectedButton.getMenu();

        if (subMenu)
        {
          // Open previously hovered item
          menu.setOpenedButton(selectedButton);

          // Hover first item in new submenu
          var first = this._getChild(subMenu, 0, 1);
          if (first) {
            subMenu.setSelectedButton(first);
          }

          return;
        }
      }

      // No hover and no open item
      // When first button has a menu, open it, otherwise only hover it
      else if (!menu.getOpenedButton())
      {
        var first = this._getChild(menu, 0, 1);

        if (first)
        {
          menu.setSelectedButton(first);

          if (first.getMenu()) {
            menu.setOpenedButton(first);
          }

          return;
        }
      }

      // Jump to the next toolbar button
      var menuOpener = menu.getOpener();

      // Look up opener hierarchy for menu button
      if (menuOpener instanceof qx.ui.menu.Button && selectedButton)
      {
        // From one inner selected button try to find the top level
        // menu button which has opened the whole menu chain.
        while (menuOpener)
        {
          menuOpener = menuOpener.getLayoutParent();
          if (menuOpener instanceof qx.ui.menu.Menu)
          {
            menuOpener = menuOpener.getOpener();
            if (menuOpener instanceof qx.ui.menubar.Button) {
              break;
            }
          }
          else
          {
            break;
          }
        }

        if (!menuOpener) {
          return;
        }
      }

      // Ask the toolbar for the next menu button
      if (menuOpener instanceof qx.ui.menubar.Button)
      {
        var buttons = menuOpener.getMenuBar().getMenuButtons();
        var index = buttons.indexOf(menuOpener);

        // This should not happen, definitely!
        if (index === -1) {
          return;
        }

        // Get next button, fallback to first if end arrived
        var nextButton = null;
        var length =  buttons.length;
        for (var i = 1; i <= length; i++)
        {
          var button = buttons[(index + i) % length];
          if(button.isEnabled() && button.isVisible()) {
            nextButton = button;
            break;
          }
        }

        if (nextButton && nextButton != menuOpener) {
          nextButton.open(true);
        }
      }
    },


    /**
     * Event handler for <code>Enter</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @param button {qx.ui.menu.AbstractButton} The selected button
     * @param e {qx.event.type.KeySequence} The keypress event
     * @return {void}
     */
    _onKeyPressEnter : function(menu, button, e)
    {
      // Route keypress event to the selected button
      if (button.hasListener("keypress"))
      {
        // Clone and reconfigure event
        var clone = e.clone();
        clone.setBubbles(false);
        clone.setTarget(button);

        // Finally dispatch the clone
        button.dispatchEvent(clone);
      }

      // Hide all open menus
      this.hideAll();
    },


    /**
     * Event handler for <code>Space</code> key
     *
     * @param menu {qx.ui.menu.Menu} The active menu
     * @param button {qx.ui.menu.AbstractButton} The selected button
     * @param e {qx.event.type.KeySequence} The keypress event
     * @return {void}
     */
    _onKeyPressSpace : function(menu, button, e)
    {
      // Route keypress event to the selected button
      if (button.hasListener("keypress"))
      {
        // Clone and reconfigure event
        var clone = e.clone();
        clone.setBubbles(false);
        clone.setTarget(button);

        // Finally dispatch the clone
        button.dispatchEvent(clone);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var Registration = qx.event.Registration;
    var el = document.body;

    // React on mousedown/mouseup events
    Registration.removeListener(window.document.documentElement, "mousedown", this._onMouseDown, this, true);

    // React on keypress events
    Registration.removeListener(el, "keydown", this._onKeyUpDown, this, true);
    Registration.removeListener(el, "keyup", this._onKeyUpDown, this, true);
    Registration.removeListener(el, "keypress", this._onKeyPress, this, true);

    this._disposeObjects("__openTimer", "__closeTimer");
    this._disposeArray("__objects");
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
 * The menu is a popup like control which supports buttons. It comes
 * with full keyboard navigation and an improved timeout based mouse
 * control behavior.
 *
 * This class is the container for all derived instances of
 * {@link qx.ui.menu.AbstractButton}.
 *
 * @childControl slidebar {qx.ui.menu.MenuSlideBar} shows a slidebar to easily navigate inside the menu (if too little space is left)
 */
qx.Class.define("qx.ui.menu.Menu",
{
  extend : qx.ui.core.Widget,

  include : [
    qx.ui.core.MPlacement,
    qx.ui.core.MRemoteChildrenHandling
  ],


  construct : function()
  {
    this.base(arguments);

    // Use hard coded layout
    this._setLayout(new qx.ui.menu.Layout);

    // Automatically add to application's root
    var root = this.getApplicationRoot();
    root.add(this);

    // Register mouse listeners
    this.addListener("mouseover", this._onMouseOver);
    this.addListener("mouseout", this._onMouseOut);

    // add resize listener
    this.addListener("resize", this._onResize, this);
    root.addListener("resize", this._onResize, this);

    this._blocker = new qx.ui.core.Blocker(root);

    // Initialize properties
    this.initVisibility();
    this.initKeepFocus();
    this.initKeepActive();
  },



  properties :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET PROPERTIES
    ---------------------------------------------------------------------------
    */

    // overridden
    appearance :
    {
      refine : true,
      init : "menu"
    },

    // overridden
    allowGrowX :
    {
      refine : true,
      init: false
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init: false
    },

    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    // overridden
    keepFocus :
    {
      refine : true,
      init : true
    },

    // overridden
    keepActive :
    {
      refine : true,
      init : true
    },


    /*
    ---------------------------------------------------------------------------
      STYLE OPTIONS
    ---------------------------------------------------------------------------
    */

    /** The spacing between each cell of the menu buttons */
    spacingX :
    {
      check : "Integer",
      apply : "_applySpacingX",
      init : 0,
      themeable : true
    },

    /** The spacing between each menu button */
    spacingY :
    {
      check : "Integer",
      apply : "_applySpacingY",
      init : 0,
      themeable : true
    },

    /**
    * Default icon column width if no icons are rendered.
    * This property is ignored as soon as an icon is present.
    */
    iconColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyIconColumnWidth"
    },

    /** Default arrow column width if no sub menus are rendered */
    arrowColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyArrowColumnWidth"
    },

    /**
     * Color of the blocker
     */
    blockerColor :
    {
      check : "Color",
      init : null,
      nullable: true,
      apply : "_applyBlockerColor",
      themeable: true
    },

    /**
     * Opacity of the blocker
     */
    blockerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyBlockerOpacity",
      themeable: true
    },


    /*
    ---------------------------------------------------------------------------
      FUNCTIONALITY PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The currently selected button */
    selectedButton :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applySelectedButton"
    },

    /** The currently opened button (sub menu is visible) */
    openedButton :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyOpenedButton"
    },

    /** Widget that opened the menu */
    opener :
    {
      check : "qx.ui.core.Widget",
      nullable : true
    },




    /*
    ---------------------------------------------------------------------------
      BEHAVIOR PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Interval in ms after which sub menus should be opened */
    openInterval :
    {
      check : "Integer",
      themeable : true,
      init : 250,
      apply : "_applyOpenInterval"
    },

    /** Interval in ms after which sub menus should be closed  */
    closeInterval :
    {
      check : "Integer",
      themeable : true,
      init : 250,
      apply : "_applyCloseInterval"
    },

    /** Blocks the background if value is <code>true<code> */
    blockBackground :
    {
      check : "Boolean",
      themeable : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __scheduledOpen : null,
    __onAfterSlideBarAdd : null,

    /** {qx.ui.core.Blocker} blocker for background blocking */
    _blocker : null,

    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Opens the menu and configures the opener
     */
    open : function()
    {
      if (this.getOpener() != null)
      {
        this.placeToWidget(this.getOpener());
        this.__updateSlideBar();
        this.show();

        this._placementTarget = this.getOpener();
      } else {
        this.warn("The menu instance needs a configured 'opener' widget!");
      }
    },


    /**
     * Opens the menu at the mouse cursor position
     *
     * @param e {qx.event.type.Mouse}  Mouse event to align to
     */
    openAtMouse : function(e)
    {
      this.placeToMouse(e);
      this.__updateSlideBar();
      this.show();

      this._placementTarget = {
        left: e.getDocumentLeft(),
        top: e.getDocumentTop()
      };
    },


    /**
     * Opens the menu in relation to the given point
     *
     * @param point {Map} Coordinate of any point with the keys <code>left</code>
     *   and <code>top</code>.
     */
    openAtPoint : function(point)
    {
      this.placeToPoint(point);
      this.__updateSlideBar();
      this.show();

      this._placementTarget = point;
    },


    /**
     * Convenience method to add a separator to the menu
     */
    addSeparator : function() {
      this.add(new qx.ui.menu.Separator);
    },


    /**
     * Returns the column sizes detected during the pre-layout phase
     *
     * @return {Array} List of all column widths
     */
    getColumnSizes : function() {
      return this._getMenuLayout().getColumnSizes();
    },


    /**
     * Return all selectable menu items.
     *
     * @return {qx.ui.core.Widget[]} selectable widgets
     */
    getSelectables : function() {
      var result = [];
      var children = this.getChildren();

      for (var i = 0; i < children.length; i++)
      {
        if (children[i].isEnabled()) {
          result.push(children[i]);
        }
      }

      return result;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIconColumnWidth : function(value, old) {
      this._getMenuLayout().setIconColumnWidth(value);
    },


    // property apply
    _applyArrowColumnWidth : function(value, old) {
      this._getMenuLayout().setArrowColumnWidth(value);
    },


    // property apply
    _applySpacingX : function(value, old) {
      this._getMenuLayout().setColumnSpacing(value);
    },


    // property apply
    _applySpacingY : function(value, old) {
      this._getMenuLayout().setSpacing(value);
    },


    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);

      var mgr = qx.ui.menu.Manager.getInstance();

      if (value === "visible")
      {
        // Register to manager (zIndex handling etc.)
        mgr.add(this);

        // Mark opened in parent menu
        var parentMenu = this.getParentMenu();
        if (parentMenu) {
          parentMenu.setOpenedButton(this.getOpener());
        }
      }
      else if (old === "visible")
      {
        // Deregister from manager (zIndex handling etc.)
        mgr.remove(this);

        // Unmark opened in parent menu
        var parentMenu = this.getParentMenu();
        if (parentMenu && parentMenu.getOpenedButton() == this.getOpener()) {
          parentMenu.resetOpenedButton();
        }

        // Clear properties
        this.resetOpenedButton();
        this.resetSelectedButton();
      }

      this.__updateBlockerVisibility();
    },


    /**
     * Updates the blocker's visibility
     */
    __updateBlockerVisibility : function()
    {
      if (this.isVisible())
      {
        if (this.getBlockBackground()) {
          var zIndex = this.getZIndex();
          this._blocker.blockContent(zIndex - 1);
        }
      }
      else
      {
        if (this._blocker.isContentBlocked()) {
          this._blocker.unblockContent();
        }
      }
    },


    /**
     * Get the parent menu. Returns <code>null</code> if the menu doesn't have a
     * parent menu.
     *
     * @return {Menu|null} The parent menu.
     */
    getParentMenu : function()
    {
      var widget = this.getOpener();
      if (!widget || !(widget instanceof qx.ui.menu.AbstractButton)) {
        return null;
      }

      if (widget && widget.getContextMenu() === this) {
        return null;
      }

      while (widget && !(widget instanceof qx.ui.menu.Menu)) {
        widget = widget.getLayoutParent();
      }
      return widget;
    },


    // property apply
    _applySelectedButton : function(value, old)
    {
      if (old) {
        old.removeState("selected");
      }

      if (value) {
        value.addState("selected");
      }
    },


    // property apply
    _applyOpenedButton : function(value, old)
    {
      if (old && old.getMenu()) {
        old.getMenu().exclude();
      }

      if (value) {
        value.getMenu().open();
      }
    },


    // property apply
    _applyBlockerColor : function(value, old) {
      this._blocker.setColor(value);
    },


    // property apply
    _applyBlockerOpacity : function(value, old) {
      this._blocker.setOpacity(value);
    },


    /*
    ---------------------------------------------------------------------------
    SCROLLING SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("slidebar", true) || this;
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "slidebar":
          var control = new qx.ui.menu.MenuSlideBar();

          var layout = this._getLayout();
          this._setLayout(new qx.ui.layout.Grow());

          var slidebarLayout = control.getLayout();
          control.setLayout(layout);
          slidebarLayout.dispose();

          var children = qx.lang.Array.clone(this.getChildren());
          for (var i=0; i<children.length; i++) {
            control.add(children[i]);
          }

          this.removeListener("resize", this._onResize, this);
          control.getChildrenContainer().addListener("resize", this._onResize, this);

          this._add(control);

        break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Get the menu layout manager
     *
     * @return {Layout} The menu layout manager
     */
    _getMenuLayout : function()
    {
      if (this.hasChildControl("slidebar")) {
        return this.getChildControl("slidebar").getChildrenContainer().getLayout();
      } else {
        return this._getLayout();
      }
    },


    /**
     * Get the menu bounds
     *
     * @return {Map} The menu bounds
     */
    _getMenuBounds : function()
    {
      if (this.hasChildControl("slidebar")) {
        return this.getChildControl("slidebar").getChildrenContainer().getBounds();
      } else {
        return this.getBounds();
      }
    },


    /**
     * Computes the size of the menu. This method is used by the
     * {@link qx.ui.core.MPlacement} mixin.
     */
    _computePlacementSize : function() {
      return this._getMenuBounds();
    },


    /**
     * Updates the visibility of the slidebar based on the menu's current size
     * and position.
     */
    __updateSlideBar : function()
    {
      var menuBounds = this._getMenuBounds();
      if (!menuBounds)
      {
        this.addListenerOnce("resize", this.__updateSlideBar, this)
        return;
      }

      var rootHeight = this.getLayoutParent().getBounds().height;
      var top = this.getLayoutProperties().top;
      var left = this.getLayoutProperties().left;

      // Adding the slidebar must be deferred because this call can happen
      // during the layout flush, which make it impossible to move existing
      // layout to the slidebar
      if (top < 0)
      {
        this._assertSlideBar(function() {
          this.setHeight(menuBounds.height + top);
          this.moveTo(left, 0);
        });
      }
      else if (top + menuBounds.height > rootHeight)
      {
        this._assertSlideBar(function() {
          this.setHeight(rootHeight - top);
        });
      }
      else
      {
        this.setHeight(null);
      }
    },


    /**
     * Schedules the addition of the slidebar and calls the given callback
     * after the slidebar has been added.
     *
     * @param callback {Function} the callback to call
     */
    _assertSlideBar : function(callback)
    {
      if (this.hasChildControl("slidebar")) {
        return callback.call(this);
      }

      this.__onAfterSlideBarAdd = callback;
      qx.ui.core.queue.Widget.add(this);
    },


    // overridden
    syncWidget : function(jobs)
    {
      this.getChildControl("slidebar");
      if (this.__onAfterSlideBarAdd)
      {
        this.__onAfterSlideBarAdd.call(this);
        delete this.__onAfterSlideBarAdd;
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Update position if the menu or the root is resized
     */
    _onResize : function()
    {
      if (this.isVisible())
      {
        var target = this._placementTarget;
        if (!target) {
          return
        } else if (target instanceof qx.ui.core.Widget) {
          this.placeToWidget(target);
        } else if (target.top !== undefined) {
          this.placeToPoint(target);
        } else {
          throw new Error("Unknown target: " + target);
        }
        this.__updateSlideBar();
      }
    },


    /**
     * Event listener for mouseover event.
     *
     * @param e {qx.event.type.Mouse} mouseover event
     * @return {void}
     */
    _onMouseOver : function(e)
    {
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Be sure this menu is kept
      mgr.cancelClose(this);

      // Change selection
      var target = e.getTarget();
      if (target.isEnabled() && target instanceof qx.ui.menu.AbstractButton)
      {
        // Select button directly
        this.setSelectedButton(target);

        var subMenu = target.getMenu && target.getMenu();
        if (subMenu)
        {
          subMenu.setOpener(target);

          // Finally schedule for opening
          mgr.scheduleOpen(subMenu);

          // Remember scheduled menu for opening
          this.__scheduledOpen = subMenu;
        }
        else
        {
          var opened = this.getOpenedButton();
          if (opened) {
            mgr.scheduleClose(opened.getMenu());
          }

          if (this.__scheduledOpen)
          {
            mgr.cancelOpen(this.__scheduledOpen);
            this.__scheduledOpen = null;
          }
        }
      }
      else if (!this.getOpenedButton())
      {
        // When no button is opened reset the selection
        // Otherwise keep it
        this.resetSelectedButton();
      }
    },


    /**
     * Event listener for mouseout event.
     *
     * @param e {qx.event.type.Mouse} mouseout event
     * @return {void}
     */
    _onMouseOut : function(e)
    {
      // Cache manager
      var mgr = qx.ui.menu.Manager.getInstance();

      // Detect whether the related target is out of the menu
      if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget()))
      {
        // Update selected property
        // Force it to the open sub menu in cases where that is opened
        // Otherwise reset it. Menus which are left by the cursor should
        // not show any selection.
        var opened = this.getOpenedButton();
        opened ? this.setSelectedButton(opened) : this.resetSelectedButton();

        // Cancel a pending close request for the currently
        // opened sub menu
        if (opened) {
          mgr.cancelClose(opened.getMenu());
        }

        // When leaving this menu to the outside, stop
        // all pending requests to open any other sub menu
        if (this.__scheduledOpen) {
          mgr.cancelOpen(this.__scheduledOpen);
        }
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (!qx.core.ObjectRegistry.inShutDown) {
      qx.ui.menu.Manager.getInstance().remove(this);
    }

    this.getApplicationRoot().removeListener("resize", this._onResize, this);
    this._placementTarget = null;
    this._disposeObjects("_blocker");
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
 * Layouter used by the qooxdoo menu's to render their buttons
 *
 * @internal
 */
qx.Class.define("qx.ui.menu.Layout",
{
  extend : qx.ui.layout.VBox,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Spacing between each cell on the menu buttons */
    columnSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },

    /**
     * Whether a column and which column should automatically span
     * when the following cell is empty. Spanning may be disabled
     * through setting this property to <code>null</code>.
     */
    spanColumn :
    {
      check : "Integer",
      init : 1,
      nullable : true,
      apply : "_applyLayoutChange"
    },

    /** Default icon column width if no icons are rendered */
    iconColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyLayoutChange"
    },

    /** Default arrow column width if no sub menus are rendered */
    arrowColumnWidth :
    {
      check : "Integer",
      init : 0,
      themeable : true,
      apply : "_applyLayoutChange"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __columnSizes : null,

    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var child, sizes, spacing;

      var spanColumn = this.getSpanColumn();
      var columnSizes = this.__columnSizes = [0, 0, 0, 0];
      var columnSpacing = this.getColumnSpacing();
      var spanColumnWidth = 0;
      var maxInset = 0;

      // Compute column sizes and insets
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.isAnonymous()) {
          continue;
        }

        sizes = child.getChildrenSizes();

        for (var column=0; column<sizes.length; column++)
        {
          if (spanColumn != null && column == spanColumn && sizes[spanColumn+1] == 0) {
            spanColumnWidth = Math.max(spanColumnWidth, sizes[column]);
          } else {
            columnSizes[column] = Math.max(columnSizes[column], sizes[column])
          }
        }

        var insets = children[i].getInsets();
        maxInset = Math.max(maxInset, insets.left + insets.right);
      }

      // Fix label column width is cases where the maximum button with no shortcut
      // is larger than the maximum button with a shortcut
      if (spanColumn != null && columnSizes[spanColumn] + columnSpacing + columnSizes[spanColumn+1] < spanColumnWidth) {
        columnSizes[spanColumn] = spanColumnWidth - columnSizes[spanColumn+1] - columnSpacing;
      }

      // When merging the cells for label and shortcut
      // ignore the spacing between them
      if (spanColumnWidth == 0) {
        spacing = columnSpacing * 2;
      } else {
        spacing = columnSpacing * 3;
      }

      // Fix zero size icon column
      if (columnSizes[0] == 0) {
        columnSizes[0] = this.getIconColumnWidth();
      }

      // Fix zero size arrow column
      if (columnSizes[3] == 0) {
        columnSizes[3] = this.getArrowColumnWidth();
      }

      var height = this.base(arguments).height;

      // Build hint
      return {
        minHeight: height,
        height : height,
        width : qx.lang.Array.sum(columnSizes) + maxInset + spacing
      };
    },



    /*
    ---------------------------------------------------------------------------
      CUSTOM ADDONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the column sizes detected during the pre-layout phase
     *
     * @return {Array} List of all column widths
     */
    getColumnSizes : function() {
      return this.__columnSizes || null;
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this.__columnSizes = null;
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
 * This widget draws a separator line between two instances of
 * {@link qx.ui.menu.AbstractButton} and is inserted into the
 * {@link qx.ui.menu.Menu}.
 *
 * For convenience reasons there is also
 * a method {@link qx.ui.menu.Menu#addSeparator} to append instances
 * of this class to the menu.
 */
qx.Class.define("qx.ui.menu.Separator",
{
  extend : qx.ui.core.Widget,




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
      init : "menu-separator"
    },

    // overridden
    anonymous :
    {
      refine : true,
      init : true
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
 * The abstract menu button class is used for all type of menu content
 * for example normal buttons, checkboxes or radiobuttons.
 *
 * @childControl icon {qx.ui.basic.Image} icon of the button
 * @childControl label {qx.ui.basic.Label} label of the button
 * @childControl shortcut {qx.ui.basic.Label} shows if specified the shortcut
 * @childControl arrow {qx.ui.basic.Image} shows the arrow to show an additional widget (e.g. popup or submenu)
 */
qx.Class.define("qx.ui.menu.AbstractButton",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MExecutable],
  implement : [qx.ui.form.IExecutable],
  type : "abstract",


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Use hard coded layout
    this._setLayout(new qx.ui.menu.ButtonLayout);

    // Add listeners
    this.addListener("click", this._onClick);
    this.addListener("keypress", this._onKeyPress);

    // Add command listener
    this.addListener("changeCommand", this._onChangeCommand, this);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    blockToolTip :
    {
      refine : true,
      init : true
    },

    /** The label text of the button */
    label :
    {
      check : "String",
      apply : "_applyLabel",
      nullable : true,
      event: "changeLabel"
    },

    /** Whether a sub menu should be shown and which one */
    menu :
    {
      check : "qx.ui.menu.Menu",
      apply : "_applyMenu",
      nullable : true,
      dereference : true,
      event : "changeMenu"
    },

    /** The icon to use */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      themeable : true,
      nullable : true,
      event: "changeIcon"
    }
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "icon":
          control = new qx.ui.basic.Image;
          control.setAnonymous(true);
          this._add(control, {column:0});
          break;

        case "label":
          control = new qx.ui.basic.Label;
          control.setAnonymous(true);
          this._add(control, {column:1});
          break;

        case "shortcut":
          control = new qx.ui.basic.Label;
          control.setAnonymous(true);
          this._add(control, {column:2});
          break;

        case "arrow":
          control = new qx.ui.basic.Image;
          control.setAnonymous(true);
          this._add(control, {column:3});
          break;
      }

      return control || this.base(arguments, id);
    },


    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      selected : 1
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the dimensions of all children
     *
     * @return {Array} Preferred width of each child
     */
    getChildrenSizes : function()
    {
      var iconWidth=0, labelWidth=0, shortcutWidth=0, arrowWidth=0;

      if (this._isChildControlVisible("icon"))
      {
        var icon = this.getChildControl("icon");
        iconWidth = icon.getMarginLeft() + icon.getSizeHint().width + icon.getMarginRight();
      }

      if (this._isChildControlVisible("label"))
      {
        var label = this.getChildControl("label");
        labelWidth = label.getMarginLeft() + label.getSizeHint().width + label.getMarginRight();
      }

      if (this._isChildControlVisible("shortcut"))
      {
        var shortcut = this.getChildControl("shortcut");
        shortcutWidth = shortcut.getMarginLeft() + shortcut.getSizeHint().width + shortcut.getMarginRight();
      }

      if (this._isChildControlVisible("arrow"))
      {
        var arrow = this.getChildControl("arrow");
        arrowWidth = arrow.getMarginLeft() + arrow.getSizeHint().width + arrow.getMarginRight();
      }

      return [ iconWidth, labelWidth, shortcutWidth, arrowWidth ];
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event listener for click
     *
     * @param e {qx.event.type.Mouse} mouseup event
     */
    _onClick : function(e) {
      // pass
    },


    /**
     * Event listener for mouseup event
     *
     * @param e {qx.event.type.KeySequence} keypress event
     */
    _onKeyPress : function(e) {
      // pass
    },


    /**
     * Event listener for command changes. Updates the text of the shortcut.
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onChangeCommand : function(e)
    {
      var command = e.getData();

      // do nothing if no command is set
      if (command == null) {
        return;
      }

      if (qx.core.Environment.get("qx.dynlocale"))
      {
        var oldCommand = e.getOldData();
        if (!oldCommand) {
          qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
        }
        if (!command) {
          qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
        }
      }

      var cmdString = command != null ? command.toString() : "";
      this.getChildControl("shortcut").setValue(cmdString);
    },


    /**
     * Update command string on locale changes
     */
    _onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e) {
        var command = this.getCommand();
        if (command != null) {
          this.getChildControl("shortcut").setValue(command.toString());
        }
      },

      "false" : null
    }),


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyIcon : function(value, old)
    {
      if (value) {
        this._showChildControl("icon").setSource(value);
      } else {
        this._excludeChildControl("icon");
      }
    },

    // property apply
    _applyLabel : function(value, old)
    {
      if (value) {
        this._showChildControl("label").setValue(value);
      } else {
        this._excludeChildControl("label");
      }
    },

    // property apply
    _applyMenu : function(value, old)
    {
      if (old)
      {
        old.resetOpener();
        old.removeState("submenu");
      }

      if (value)
      {
        this._showChildControl("arrow");

        value.setOpener(this);
        value.addState("submenu");
      }
      else
      {
        this._excludeChildControl("arrow");
      }
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this.removeListener("changeCommand", this._onChangeCommand, this);

    if (this.getMenu())
    {
      if (!qx.core.ObjectRegistry.inShutDown) {
        this.getMenu().destroy();
      }
    }

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
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
 * Layout used for the menu buttons which may contain four elements. A icon,
 * a label, a shortcut text and an arrow (for a sub menu)
 *
 * @internal
 */
qx.Class.define("qx.ui.menu.ButtonLayout",
{
  extend : qx.ui.layout.Abstract,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    verifyLayoutProperty : qx.core.Environment.select("qx.debug",
    {
      "true" : function(item, name, value) {
        this.assert(name=="column", "The property '"+name+"' is not supported by the MenuButton layout!");
      },

      "false" : null
    }),


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var children = this._getLayoutChildren();
      var child;
      var column;

      var columnChildren = [];
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        column = child.getLayoutProperties().column;
        columnChildren[column] = child;
      }

      var menu = this.__getMenu(children[0]);

      var columns = menu.getColumnSizes();
      var spacing = menu.getSpacingX();

      // stretch label column
      var neededWidth = qx.lang.Array.sum(columns) + spacing * (columns.length - 1);
      if (neededWidth < availWidth) {
        columns[1] += availWidth - neededWidth;
      }


      var left=0, top=0;
      var Util = qx.ui.layout.Util;

      for (var i=0, l=columns.length; i<l; i++)
      {
        child = columnChildren[i];

        if (child)
        {
          var hint = child.getSizeHint();
          var top = Util.computeVerticalAlignOffset(child.getAlignY()||"middle", hint.height, availHeight, 0, 0);
          var offsetLeft = Util.computeHorizontalAlignOffset(child.getAlignX()||"left", hint.width, columns[i], child.getMarginLeft(), child.getMarginRight());
          child.renderLayout(left + offsetLeft, top, hint.width, hint.height);
        }

        if (columns[i] > 0) {
          left += columns[i] + spacing;
        }
      }
    },


    /**
     * Get the widget's menu
     *
     * @param widget {qx.ui.core.Widget} the widget to get the menu for
     * @return {qx.ui.menu.Menu} the menu
     */
    __getMenu : function(widget)
    {
      while (!(widget instanceof qx.ui.menu.Menu)) {
        widget = widget.getLayoutParent();
      }
      return widget;
    },


    // overridden
    _computeSizeHint : function()
    {
      var children = this._getLayoutChildren();
      var neededHeight = 0;
      var neededWidth = 0;

      for (var i=0, l=children.length; i<l; i++)
      {
        var hint = children[i].getSizeHint();
        neededWidth += hint.width;
        neededHeight = Math.max(neededHeight, hint.height);
      }

      return {
        width : neededWidth,
        height : neededHeight
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
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Container, which provides scrolling in one dimension (vertical or horizontal).
 *
 * @childControl button-forward {qx.ui.form.RepeatButton} button to step forward
 * @childControl button-backward {qx.ui.form.RepeatButton} button to step backward
 * @childControl content {qx.ui.container.Composite} container to hold the content
 * @childControl scrollpane {qx.ui.core.scroll.ScrollPane} the scroll pane holds the content to enable scrolling
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create slide bar container
 *   slideBar = new qx.ui.container.SlideBar().set({
 *     width: 300
 *   });
 *
 *   // set layout
 *   slideBar.setLayout(new qx.ui.layout.HBox());
 *
 *   // add some widgets
 *   for (var i=0; i<10; i++)
 *   {
 *     slideBar.add((new qx.ui.core.Widget()).set({
 *       backgroundColor : (i % 2 == 0) ? "red" : "blue",
 *       width : 60
 *     }));
 *   }
 *
 *   this.getRoot().add(slideBar);
 * </pre>
 *
 * This example creates a SlideBar and add some widgets with alternating
 * background colors. Since the content is larger than the container, two
 * scroll buttons at the left and the right edge are shown.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/slidebar.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.container.SlideBar",
{
  extend : qx.ui.core.Widget,

  include :
  [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MRemoteLayoutHandling
  ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} The slide bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    var scrollPane = this.getChildControl("scrollpane");
    this._add(scrollPane, {flex: 1});

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    this.addListener("mousewheel", this._onMouseWheel, this);
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
      init : "slidebar"
    },

    /** Orientation of the bar */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "horizontal",
      apply : "_applyOrientation"
    },

    /** The number of pixels to scroll if the buttons are pressed */
    scrollStep :
    {
      check : "Integer",
      init : 15,
      themeable : true
    }
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("content");
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteForward, this);
          control.setFocusable(false);
          this._addAt(control, 2);
          break;

        case "button-backward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteBackward, this);
          control.setFocusable(false);
          this._addAt(control, 0);
          break;

        case "content":
          control = new qx.ui.container.Composite();

          /*
           * Gecko < 2 does not update the scroll position after removing an
           * element. So we have to do this by hand.
           */
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            parseInt(qx.core.Environment.get("engine.version")) < 2)
          {
            control.addListener("removeChildWidget", this._onRemoveChild, this);
          }

          this.getChildControl("scrollpane").add(control);
          break;

        case "scrollpane":
          control = new qx.ui.core.scroll.ScrollPane();
          control.addListener("update", this._onResize, this);
          control.addListener("scrollX", this._onScroll, this);
          control.addListener("scrollY", this._onScroll, this);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates :
    {
      barLeft : true,
      barTop : true,
      barRight : true,
      barBottom : true
    },

    /*
    ---------------------------------------------------------------------------
      PUBLIC SCROLL API
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the element's content by the given amount.
     *
     * @param offset {Integer?0} Amount to scroll
     * @return {void}
     */
    scrollBy : function(offset)
    {
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        pane.scrollByX(offset);
      } else {
        pane.scrollByY(offset);
      }
    },


    /**
     * Scrolls the element's content to the given coordinate
     *
     * @param value {Integer} The position to scroll to.
     * @return {void}
     */
    scrollTo : function(value)
    {
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        pane.scrollToX(value);
      } else {
        pane.scrollToY(value);
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // overridden
    _applyEnabled : function(value, old, name) {
      this.base(arguments, value, old, name);
      this._updateArrowsEnabled();
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var oldLayouts = [this.getLayout(), this._getLayout()];
      var buttonForward = this.getChildControl("button-forward");
      var buttonBackward = this.getChildControl("button-backward");

      // old can also be null, so we have to check both explicitly to set
      // the states correctly.
      if (old == "vertical")
      {
        buttonForward.removeState("vertical");
        buttonBackward.removeState("vertical");
        buttonForward.addState("horizontal");
        buttonBackward.addState("horizontal");
      }
      else if (old == "horizontal")
      {
        buttonForward.removeState("horizontal");
        buttonBackward.removeState("horizontal");
        buttonForward.addState("vertical");
        buttonBackward.addState("vertical");
      }


      if (value == "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());
        this.setLayout(new qx.ui.layout.HBox());
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());
        this.setLayout(new qx.ui.layout.VBox());
      }

      if (oldLayouts[0]) {
        oldLayouts[0].dispose();
      }

      if (oldLayouts[1]) {
        oldLayouts[1].dispose();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls pane on mousewheel events
     *
     * @param e {qx.event.type.Mouse} the mouse event
     */
    _onMouseWheel : function(e)
    {
      var delta = 0;
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        delta = e.getWheelDelta("x");

        var position = pane.getScrollX();
        var max = pane.getScrollMaxX();
        var steps = parseInt(delta);

        // pass the event to the parent if both scrollbars are at the end
        if (!(
          steps < 0 && position <= 0 ||
          steps > 0 && position >= max ||
          delta == 0)
        ) {
          e.stop();
        }
      } else {
        delta = e.getWheelDelta("y");

        var position = pane.getScrollY();
        var max = pane.getScrollMaxY();
        var steps = parseInt(delta);

        // pass the event to the parent if both scrollbars are at the end
        if (!(
          steps < 0 && position <= 0 ||
          steps > 0 && position >= max ||
          delta == 0
        )) {
          e.stop();
        }
      }

      this.scrollBy(delta * this.getScrollStep());
    },


    /**
     * Update arrow enabled state after scrolling
     */
    _onScroll : function() {
      this._updateArrowsEnabled();
    },


    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queuing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @param e {Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var content = this.getChildControl("scrollpane").getChildren()[0];
      if (!content) {
        return;
      }

      var innerSize = this.getInnerSize();
      var contentSize = content.getBounds();

      var overflow = (this.getOrientation() === "horizontal") ?
        contentSize.width > innerSize.width :
        contentSize.height > innerSize.height;

      if (overflow) {
        this._showArrows()
        this._updateArrowsEnabled();
      } else {
        this._hideArrows();
      }
    },


    /**
     * Scroll handler for left scrolling
     *
     * @return {void}
     */
    _onExecuteBackward : function() {
      this.scrollBy(-this.getScrollStep());
    },


    /**
     * Scroll handler for right scrolling
     *
     * @return {void}
     */
    _onExecuteForward : function() {
      this.scrollBy(this.getScrollStep());
    },


    /**
     * Helper function for Gecko. Modifies the scroll offset when a child is
     * removed.
     */
    _onRemoveChild : function()
    {
      qx.event.Timer.once(
        function()
        {
          // It might happen that the child control is already disposed in very
          // seldom cases - anyway check against that (Bug #5339)
          var scrollpane = this.getChildControl("scrollpane");
          if (!scrollpane.isDisposed()) {
            this.scrollBy(scrollpane.getScrollX());
          }
        },
        this,
        50
      );
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Update arrow enabled state
     */
    _updateArrowsEnabled : function()
    {
      // set the disables state directly because we are overriding the
      // inheritance
      if (!this.getEnabled()) {
        this.getChildControl("button-backward").setEnabled(false);
        this.getChildControl("button-forward").setEnabled(false);
        return;
      }

      var pane = this.getChildControl("scrollpane");

      if (this.getOrientation() === "horizontal")
      {
        var position = pane.getScrollX();
        var max = pane.getScrollMaxX();
      }
      else
      {
        var position = pane.getScrollY();
        var max = pane.getScrollMaxY();
      }

      this.getChildControl("button-backward").setEnabled(position > 0);
      this.getChildControl("button-forward").setEnabled(position < max);
    },


    /**
     * Show the arrows (Called from resize event)
     *
     * @return {void}
     */
    _showArrows : function()
    {
      this._showChildControl("button-forward");
      this._showChildControl("button-backward");
    },


    /**
     * Hide the arrows (Called from resize event)
     *
     * @return {void}
     */
    _hideArrows : function()
    {
      this._excludeChildControl("button-forward");
      this._excludeChildControl("button-backward");

      this.scrollTo(0);
    }
  }

});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The MenuSlideBar is used to scroll menus if they don't fit on the screen.
 *
 * @childControl button-forward {qx.ui.form.HoverButton} scrolls forward of hovered
 * @childControl button-backward {qx.ui.form.HoverButton} scrolls backward if hovered
 *
 * @internal
 */
qx.Class.define("qx.ui.menu.MenuSlideBar",
{
  extend : qx.ui.container.SlideBar,

  construct : function()
  {
    this.base(arguments, "vertical");
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "menu-slidebar"
    }
  },

  members :
  {
    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.HoverButton();
          control.addListener("execute", this._onExecuteForward, this);
          this._addAt(control, 2);
          break;

        case "button-backward":
          control = new qx.ui.form.HoverButton();
          control.addListener("execute", this._onExecuteBackward, this);
          this._addAt(control, 0);
          break;
      }

      return control || this.base(arguments, id);
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The HoverButton is an {@link qx.ui.basic.Atom}, which fires repeatedly
 * execute events while the mouse is over the widget.
 *
 * The rate at which the execute event is fired accelerates is the mouse keeps
 * inside of the widget. The initial delay and the interval time can be set using
 * the properties {@link #firstInterval} and {@link #interval}. The
 * {@link #execute} events will be fired in a shorter amount of time if the mouse
 * remains over the widget, until the min {@link #minTimer} is reached.
 * The {@link #timerDecrease} property sets the amount of milliseconds which will
 * decreased after every firing.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var button = new qx.ui.form.HoverButton("Hello World");
 *
 *   button.addListener("execute", function(e) {
 *     alert("Button is hovered");
 *   }, this);
 *
 *   this.getRoot.add(button);
 * </pre>
 *
 * This example creates a button with the label "Hello World" and attaches an
 * event listener to the {@link #execute} event.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/hoverbutton.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.form.HoverButton",
{
  extend : qx.ui.basic.Atom,
  include : [qx.ui.core.MExecutable],
  implement : [qx.ui.form.IExecutable],

  /**
   * @param label {String} Label to use
   * @param icon {String?null} Icon to use
   */
  construct : function(label, icon)
  {
    this.base(arguments, label, icon);

    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);

    this.__timer = new qx.event.AcceleratingTimer();
    this.__timer.addListener("interval", this._onInterval, this);
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "hover-button"
    },

    /**
     * Interval used after the first run of the timer. Usually a smaller value
     * than the "firstInterval" property value to get a faster reaction.
     */
    interval :
    {
      check : "Integer",
      init  : 80
    },

    /**
     * Interval used for the first run of the timer. Usually a greater value
     * than the "interval" property value to a little delayed reaction at the first
     * time.
     */
    firstInterval :
    {
      check : "Integer",
      init  : 200
    },

    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      check : "Integer",
      init  : 20
    },

    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      check : "Integer",
      init  : 2
    }
  },


  members :
  {
    __timer : null,


    /**
     * Start timer on mouse over
     *
     * @param e {qx.event.type.Mouse} The mouse event
     */
    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.__timer.set({
        interval: this.getInterval(),
        firstInterval: this.getFirstInterval(),
        minimum: this.getMinTimer(),
        decrease: this.getTimerDecrease()
      }).start();

      this.addState("hovered");
    },


    /**
     * Stop timer on mouse out
     *
     * @param e {qx.event.type.Mouse} The mouse event
     */
    _onMouseOut : function(e)
    {
      this.__timer.stop();
      this.removeState("hovered");

      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }
    },


    /**
     * Fire execute event on timer interval event
     */
    _onInterval : function()
    {
      if (this.isEnabled())
      {
        this.execute();
      } else {
        this.__timer.stop();
      }
    }
  },


  destruct : function() {
    this._disposeObjects("__timer");
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
 * A menubar button
 */
qx.Class.define("qx.ui.menubar.Button",
{
  extend : qx.ui.form.MenuButton,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon, menu);

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
      init : "menubar-button"
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




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Inspects the parent chain to find the MenuBar
     *
     * @return {qx.ui.menubar.MenuBar} MenuBar instance or <code>null</code>.
     */
    getMenuBar : function()
    {
      var parent = this;
      while (parent)
      {
        /* this method is also used by toolbar.MenuButton, so we need to check
           for a ToolBar instance. */
        if (parent instanceof qx.ui.toolbar.ToolBar) {
          return parent;
        }

        parent = parent.getLayoutParent();
      }

      return null;
    },


    // overridden
    open : function(selectFirst) {
      this.base(arguments, selectFirst);

      var menubar = this.getMenuBar();
      menubar._setAllowMenuOpenHover(true);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange : function(e)
    {
      var menu = this.getMenu();
      var menubar = this.getMenuBar();

      if (menu.isVisible())
      {
        this.addState("pressed");

        // Sync with open menu property
        if (menubar) {
          menubar.setOpenMenu(menu);
        }
      }
      else
      {
        this.removeState("pressed");

        // Sync with open menu property
        if (menubar && menubar.getOpenMenu() == menu) {
          menubar.resetOpenMenu();
          menubar._setAllowMenuOpenHover(false);
        }
      }
    },

    // overridden
    _onMouseUp : function(e)
    {
      this.base(arguments, e);

      // Set state 'pressed' to visualize that the menu is open.
      var menu = this.getMenu();
      if (menu && menu.isVisible() && !this.hasState("pressed")) {
        this.addState("pressed");
      }
    },

    /**
     * Event listener for mouseover event
     *
     * @param e {qx.event.type.Mouse} mouseover event object
     */
    _onMouseOver : function(e)
    {
      // Add hovered state
      this.addState("hovered");

      // Open submenu
      if (this.getMenu())
      {
        var menubar = this.getMenuBar();

        if (menubar._isAllowMenuOpenHover())
        {
          // Hide all open menus
          qx.ui.menu.Manager.getInstance().hideAll();

          // Set it again, because hideAll remove it.
          menubar._setAllowMenuOpenHover(true);

          // Then show the attached menu
          if (this.isEnabled()) {
            this.open();
          }
        }
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
     * Martin Wittemann (martinwittemann)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The Toolbar class is the main part of the toolbar widget.
 *
 * It can handle added {@link Button}s, {@link CheckBox}es, {@link RadioButton}s
 * and {@link Separator}s in its {@link #add} method. The {@link #addSpacer} method
 * adds a spacer at the current toolbar position. This means that the widgets
 * added after the method call of {@link #addSpacer} are aligned to the right of
 * the toolbar.
 *
 * For more details on the documentation of the toolbar widget, take a look at the
 * documentation of the {@link qx.ui.toolbar}-Package.
 */
qx.Class.define("qx.ui.toolbar.ToolBar",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MChildrenHandling,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // add needed layout
    this._setLayout(new qx.ui.layout.HBox());

    // initialize the overflow handling
    this.__removedItems = [];
    this.__removePriority = [];
  },




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
      init : "toolbar"
    },

    /** Holds the currently open menu (when the toolbar is used for menus) */
    openMenu :
    {
      check : "qx.ui.menu.Menu",
      event : "changeOpenMenu",
      nullable : true
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      apply : "_applyShow",
      event : "changeShow"
    },

    /** The spacing between every child of the toolbar */
    spacing :
    {
      nullable : true,
      check : "Integer",
      themeable : true,
      apply : "_applySpacing"
    },

    /**
     * Widget which will be shown if at least one toolbar item is hidden.
     * Keep in mind to add this widget to the toolbar before you set it as
     * indicator!
     */
    overflowIndicator :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyOverflowIndicator"
    },

    /** Enables the overflow handling which automatically removes items.*/
    overflowHandling :
    {
      init : false,
      check : "Boolean",
      apply : "_applyOverflowHandling"
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired if an item will be hidden by the {@link #overflowHandling}.*/
    "hideItem" : "qx.event.type.Data",

    /** Fired if an item will be show by the {@link #overflowHandling}.*/
    "showItem" : "qx.event.type.Data"
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
      OVERFLOW HANDLING
    ---------------------------------------------------------------------------
    */

    __removedItems : null,
    __removePriority : null,


    // overridden
    _computeSizeHint : function()
    {
      // get the original hint
      var hint = this.base(arguments);
      if (true && this.getOverflowHandling()) {
        var minWidth = 0;
        // if an overflow widget is given, use its width + spacing as min width
        var overflowWidget = this.getOverflowIndicator();
        if (overflowWidget) {
          minWidth = overflowWidget.getSizeHint().width + this.getSpacing();
        }
        // reset the minWidth because we reduce the count of elements
        hint.minWidth = minWidth;
      }
      return hint;
    },


    /**
     * Resize event handler.
     *
     * @param e {qx.event.type.Data} The resize event.
     */
    _onResize : function(e) {
      this._recalculateOverflow(e.getData().width);
    },


    /**
     * Responsible for calculation the overflow based on the available width.
     *
     * @param width {Integer?null} The available width.
     * @param requiredWidth {Integer?null} The required width for the widget
     *   if available.
     */
    _recalculateOverflow : function(width, requiredWidth)
    {
      // do nothing if overflow handling is not enabled
      if (!this.getOverflowHandling()) {
        return;
      }

      // get all required sizes
      requiredWidth = requiredWidth || this.getSizeHint().width;
      var overflowWidget = this.getOverflowIndicator();
      var overflowWidgetWidth = 0;
      if (overflowWidget) {
        overflowWidgetWidth = overflowWidget.getSizeHint().width;
      }

      if (width == undefined && this.getBounds() != null) {
        width = this.getBounds().width;
      }

      // if we still don't have a width, than we are not added to a parrent
      if (width == undefined) {
        // we should ignore it in that case
        return;
      }

      // if we have not enough space
      if (width < requiredWidth) {
        do {
          // get the next child
          var childToHide = this._getNextToHide();
          // if there is no child to hide, just do nothing
          if (!childToHide) {
            return;
          }
          // get margins or spacing
          var margins = childToHide.getMarginLeft() + childToHide.getMarginRight();
          margins = Math.max(margins, this.getSpacing());
          var childWidth = childToHide.getSizeHint().width + margins;
          this.__hideChild(childToHide);

          // new width is the requiredWidth - the removed childs width
          requiredWidth -= childWidth;

          // show the overflowWidgetWidth
          if (overflowWidget && overflowWidget.getVisibility() != "visible") {
            overflowWidget.setVisibility("visible");
            // if we need to add the overflow indicator, we need to add its width
            requiredWidth += overflowWidgetWidth;
            // add spacing or margins
            var overflowWidgetMargins =
              overflowWidget.getMarginLeft() +
              overflowWidget.getMarginRight();
            requiredWidth += Math.max(overflowWidgetMargins, this.getSpacing());
          }
        } while (requiredWidth > width);

      // if we can possibly show something
      } else if (this.__removedItems.length > 0) {
        do {
          var removedChild = this.__removedItems[0];
          // if we have something we can show
          if (removedChild) {
            // get the margins or spacing
            var margins = removedChild.getMarginLeft() + removedChild.getMarginRight();
            margins = Math.max(margins, this.getSpacing());

            // check if the element has been rendered before [BUG #4542]
            if (removedChild.getDecoratorElement() == null) {
              // if not, apply the decorator element because it can change the
              // width of the child with padding e.g.
              removedChild.syncAppearance();
              // also invalidate the layout cache to trigger size hint
              // recalculation
              removedChild.invalidateLayoutCache();
            }
            var removedChildWidth = removedChild.getSizeHint().width;

            // check if it fits in in case its the last child to replace
            var fits = false;
            // if we can remove the overflow widget if its available
            if (this.__removedItems.length == 1 && overflowWidgetWidth > 0) {
              var addedMargin = margins - this.getSpacing();
              var wouldRequiredWidth =
                requiredWidth -
                overflowWidgetWidth +
                removedChildWidth +
                addedMargin;
              fits = width > wouldRequiredWidth;
            }

            // if it just fits in || it fits in when we remove the overflow widget
            if (width > requiredWidth + removedChildWidth + margins || fits) {
              this.__showChild(removedChild);
              requiredWidth += removedChildWidth;
              // check if we need to remove the overflow widget
              if (overflowWidget && this.__removedItems.length == 0) {
                overflowWidget.setVisibility("excluded");
              }
            } else {
              return;
            }
          }
        } while (width >= requiredWidth && this.__removedItems.length > 0);
      }
    },


    /**
     * Helper to show a toolbar item.
     *
     * @param child {qx.ui.core.Widget} The widget to show.
     */
    __showChild : function(child)
    {
      child.setVisibility("visible");
      this.__removedItems.shift();
      this.fireDataEvent("showItem", child)
    },


    /**
     * Helper to exclude a toolbar item.
     *
     * @param child {qx.ui.core.Widget} The widget to exclude.
     */
    __hideChild : function(child)
    {
      // ignore the call if no child is given
      if (!child) {
        return;
      }
      this.__removedItems.unshift(child);
      child.setVisibility("excluded");
      this.fireDataEvent("hideItem", child);
    },


    /**
     * Responsible for returning the next item to remove. In It checks the
     * priorities added by {@link #setRemovePriority}. If all priorized widgets
     * already excluded, it takes the widget added at last.
     *
     * @return {qx.ui.core.Widget|null} The widget which should be removed next.
     *   If null is returned, no widget is availablew to remove.
     */
    _getNextToHide : function()
    {
      // get the elements by priority
      for (var i = this.__removePriority.length - 1; i >= 0; i--) {
        var item = this.__removePriority[i];
        // maybe a priority is left out and spacers don't have the visibility
        if (item && item.getVisibility && item.getVisibility() == "visible") {
          return item;
        }
      };

      // if there is non found by priority, check all available widgets
      var children = this._getChildren();
      for (var i = children.length -1; i >= 0; i--) {
        var child = children[i]
        // ignore the overflow widget
        if (child == this.getOverflowIndicator()) {
          continue;
        }
        // spacer don't have the visibility
        if (child.getVisibility && child.getVisibility() == "visible") {
          return child;
        }
      };
    },


    /**
     * The removal of the toolbar items is priority based. You can change these
     * priorities with this method. The higher a priority, the earlier it will
     * be excluded. Remmeber to use every priority only once! If you want
     * override an already set priority, use the override parameter.
     * Keep in mind to only use already added items.
     *
     * @param item {qx.ui.core.Widget} The item to give the priority.
     * @param priority {Integer} The priority, higher means removed earlier.
     * @param override {Boolean} true, if the priority should be overridden.
     */
    setRemovePriority : function(item, priority, override)
    {
      // security check for overriding priorities
      if (!override && this.__removePriority[priority] != undefined) {
        throw new Error("Priority already in use!");
      }
      this.__removePriority[priority] = item;
    },


    // property apply
    _applyOverflowHandling : function(value, old)
    {
      // invalidate the own and the parrents layout cach because the size hint changes
      this.invalidateLayoutCache();
      var parent = this.getLayoutParent();
      if (parent) {
        parent.invalidateLayoutCache();
      }

      // recalculate if possible
      var bounds = this.getBounds()
      if (bounds && bounds.width) {
        this._recalculateOverflow(bounds.width);
      }

      // if the handling has been enabled
      if (value) {
        // add the resize listener
        this.addListener("resize", this._onResize, this);

      // if the handlis has been disabled
      } else {
        this.removeListener("resize", this._onResize, this);

        // set the overflow indicator to excluded
        var overflowIndicator = this.getOverflowIndicator();
        if (overflowIndicator) {
          overflowIndicator.setVisibility("excluded");
        }

        // set all buttons back to visible
        for (var i = 0; i < this.__removedItems.length; i++) {
          this.__removedItems[i].setVisibility("visible");
        };
        // reset the removed items
        this.__removedItems = [];
      }
    },


    // property apply
    _applyOverflowIndicator : function(value, old)
    {
      if (old) {
        this._remove(old);
      }

      if (value) {
        // check if its a child of the toolbar
        if (this._indexOf(value) == -1) {
          throw new Error("Widget must be child of the toolbar.");
        }
        // hide the widget
        value.setVisibility("excluded");
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU OPEN
    ---------------------------------------------------------------------------
    */

    __allowMenuOpenHover : false,

    /**
     * Indicate if a menu could be opened on hover or not.
     *
     * @internal
     * @param value {Boolean} <code>true</code> if a menu could be opened,
     *    <code>false</code> otherwise.
     */
    _setAllowMenuOpenHover : function(value) {
      this.__allowMenuOpenHover = value
    },

    /**
     * Return if a menu could be opened on hover or not.
     *
     * @internal
     * @return {Boolean} <code>true</code> if a menu could be opened,
     *    <code>false</code> otherwise.
     */
    _isAllowMenuOpenHover : function () {
      return this.__allowMenuOpenHover;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySpacing : function(value, old)
    {
      var layout = this._getLayout();
      value == null ? layout.resetSpacing() : layout.setSpacing(value);
    },


    // property apply
    _applyShow : function(value) {
      var children = this._getChildren();
      for (var i=0; i < children.length; i++) {
        if (children[i].setShow) {
          children[i].setShow(value);
        }
      };
    },


    /*
    ---------------------------------------------------------------------------
      CHILD HANDLING
    ---------------------------------------------------------------------------
    */
    // overridden
    _add : function(child, options) {
      this.base(arguments, child, options);
      // sync the show property
      if (child.setShow) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _addAt : function(child, index, options) {
      this.base(arguments, child, index, options);
      // sync the show property
      if (child.setShow) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _addBefore : function(child, before, options) {
      this.base(arguments, child, before, options);
      // sync the show property
      if (child.setShow) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _addAfter : function(child, after, options) {
      this.base(arguments, child, after, options);
      // sync the show property
      if (child.setShow) {
        child.setShow(this.getShow());
      }

      var newWidth =
        this.getSizeHint().width +
        child.getSizeHint().width +
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _remove : function(child) {
      this.base(arguments, child);
      var newWidth =
        this.getSizeHint().width -
        child.getSizeHint().width -
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _removeAt : function(index) {
      var child = this._getChildren()[index];
      this.base(arguments, index);
      var newWidth =
        this.getSizeHint().width -
        child.getSizeHint().width -
        2 * this.getSpacing();
      this._recalculateOverflow(null, newWidth);
    },

    // overridden
    _removeAll : function() {
      this.base(arguments);
      this._recalculateOverflow(null, 0);
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Add a spacer to the toolbar. The spacer has a flex
     * value of one and will stretch to the available space.
     *
     * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
     *   to the spacer is needed to remove this spacer from the layout.
     */
    addSpacer : function()
    {
      var spacer = new qx.ui.core.Spacer;
      this._add(spacer, {flex:1});
      return spacer;
    },


    /**
     * Adds a separator to the toolbar.
     */
    addSeparator : function() {
      this.add(new qx.ui.toolbar.Separator);
    },


    /**
     * Returns all nested buttons which contains a menu to show. This is mainly
     * used for keyboard support.
     *
     * @return {Array} List of all menu buttons
     */
    getMenuButtons : function()
    {
      var children = this.getChildren();
      var buttons = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child instanceof qx.ui.menubar.Button) {
          buttons.push(child);
        } else if (child instanceof qx.ui.toolbar.Part) {
          buttons.push.apply(buttons, child.getMenuButtons());
        }
      }

      return buttons;
    }
  },


  destruct : function() {
    if (this.hasListener("resize")) {
      this.removeListener("resize", this._onResize, this);
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
 * A Spacer is a "virtual" widget, which can be placed into any layout and takes
 * the space a normal widget of the same size would take.
 *
 * Spacers are invisible and very light weight because they don't require any
 * DOM modifications.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
 *   container.add(new qx.ui.core.Widget());
 *   container.add(new qx.ui.core.Spacer(50));
 *   container.add(new qx.ui.core.Widget());
 * </pre>
 *
 * This example places two widgets and a spacer into a container with a
 * horizontal box layout. In this scenario the spacer creates an empty area of
 * 50 pixel width between the two widgets.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/spacer.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.core.Spacer",
{
  extend : qx.ui.core.LayoutItem,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

 /**
  * @param width {Integer?null} the initial width
  * @param height {Integer?null} the initial height
  */
  construct : function(width, height)
  {
    this.base(arguments);

    // Initialize dimensions
    this.setWidth(width != null ? width : 0);
    this.setHeight(height != null ? height : 0);
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Helper method called from the visibility queue to detect outstanding changes
     * to the appearance.
     *
     * @internal
     */
    checkAppearanceNeeds : function() {
      // placeholder to improve compatibility with Widget.
    },


    /**
     * Recursively adds all children to the given queue
     *
     * @param queue {Map} The queue to add widgets to
     */
    addChildrenToQueue : function(queue) {
      // placeholder to improve compatibility with Widget.
    },


    /**
     * Removes this widget from its parent and dispose it.
     *
     * Please note that the widget is not disposed synchronously. The
     * real dispose happens after the next queue flush.
     *
     * @return {void}
     */
    destroy : function()
    {
      if (this.$$disposed) {
        return;
      }

      var parent = this.$$parent;
      if (parent) {
        parent._remove(this);
      }

      qx.ui.core.queue.Dispose.add(this);
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
 * A widget used for decoration proposes to structure a toolbar. Each
 * Separator renders a line between the buttons around.
 */
qx.Class.define("qx.ui.toolbar.Separator",
{
  extend : qx.ui.core.Widget,





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
      init : "toolbar-separator"
    },

    // overridden
    anonymous :
    {
      refine : true,
      init : true
    },

    // overridden
    width :
    {
      refine : true,
      init : 0
    },

    // overridden
    height :
    {
      refine : true,
      init : 0
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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A part is a container for multiple toolbar buttons. Each part comes
 * with a handle which may be used in later versions to drag the part
 * around and move it to another position. Currently mainly used
 * for structuring large toolbars beyond the capabilities of the
 * {@link Separator}.
 *
 * @childControl handle {qx.ui.basic.Image} prat handle to visualize the separation
 * @childControl container {qx.ui.toolbar.PartContainer} holds the content of the toolbar part
 */
qx.Class.define("qx.ui.toolbar.Part",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.core.MRemoteChildrenHandling],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Hard coded HBox layout
    this._setLayout(new qx.ui.layout.HBox);

    // Force creation of the handle
    this._createChildControl("handle");
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
      init : "toolbar/part"
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      event : "changeShow"
    },

    /** The spacing between every child of the toolbar */
    spacing :
    {
      nullable : true,
      check : "Integer",
      themeable : true,
      apply : "_applySpacing"
    }
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "handle":
          control = new qx.ui.basic.Image();
          control.setAlignY("middle");
          this._add(control);
          break;

        case "container":
          control = new qx.ui.toolbar.PartContainer();
          control.addListener("syncAppearance", this.__onSyncAppearance, this);
          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("container");
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applySpacing : function(value, old)
    {
      var layout = this.getChildControl("container").getLayout();
      value == null ? layout.resetSpacing() : layout.setSpacing(value);
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */
    /**
     * Helper which applies the left, right and middle states.
     */
    __onSyncAppearance : function() {
      // check every child
      var children = this.getChildrenContainer().getChildren();
      children = children.filter(function(child) {
        return child.getVisibility() == "visible";
      });
      for (var i = 0; i < children.length; i++) {
        // if its the first child
        if (i == 0 && i != children.length - 1) {
          children[i].addState("left");
          children[i].removeState("right");
          children[i].removeState("middle");
        // if its the last child
        } else if (i == children.length - 1 && i != 0) {
          children[i].addState("right");
          children[i].removeState("left");
          children[i].removeState("middle");
        // if there is only one child
        } else if (i == 0 && i == children.length - 1) {
          children[i].removeState("left");
          children[i].removeState("middle");
          children[i].removeState("right");
        } else {
          children[i].addState("middle");
          children[i].removeState("right");
          children[i].removeState("left");
        }
      };
    },


    /**
     * Adds a separator to the toolbar part.
     */
    addSeparator : function() {
      this.add(new qx.ui.toolbar.Separator);
    },


    /**
     * Returns all nested buttons which contains a menu to show. This is mainly
     * used for keyboard support.
     *
     * @return {Array} List of all menu buttons
     */
    getMenuButtons : function()
    {
      var children = this.getChildren();
      var buttons = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child instanceof qx.ui.menubar.Button) {
          buttons.push(child);
        }
      }

      return buttons;
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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The container used by {@link Part} to insert the buttons.
 *
 * @internal
 */
qx.Class.define("qx.ui.toolbar.PartContainer",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.HBox);
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
      init : "toolbar/part/container"
    },

    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon" ],
      inheritable : true,
      event : "changeShow"
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
 * The real menu button class which supports a command and an icon. All
 * other features are inherited from the {@link qx.ui.menu.AbstractButton}
 * class.
 */
qx.Class.define("qx.ui.menu.Button",
{
  extend : qx.ui.menu.AbstractButton,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param icon {String} Initial icon
   * @param command {qx.ui.core.Command} Initial command (shortcut)
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, icon, command, menu)
  {
    this.base(arguments);

    // Initialize with incoming arguments
    if (label != null) {
      this.setLabel(label);
    }

    if (icon != null) {
      this.setIcon(icon);
    }

    if (command != null) {
      this.setCommand(command);
    }

    if (menu != null) {
      this.setMenu(menu);
    }
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
      init : "menu-button"
    }
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    // overridden
    _onClick : function(e)
    {
      if (e.isLeftPressed())
      {
        this.execute();

        // don't close menus if the button is a sub menu button
        if (this.getMenu()) {
          return;
        }
      } else {
        // don't close menus if the button has a context menu
        if (this.getContextMenu()) {
          return;
        }
      }

      qx.ui.menu.Manager.getInstance().hideAll();
    },


    // overridden
    _onKeyPress : function(e) {
      this.execute();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The traditional qx.ui.menu.MenuButton to access the column visibility menu.
 */
qx.Class.define("qx.ui.table.columnmenu.Button",
{
  extend     : qx.ui.form.MenuButton,
  implement  : qx.ui.table.IColumnMenuButton,

  /**
   * Create a new instance of a column visibility menu button. This button
   * also contains the factory for creating each of the sub-widgets.
   */
  construct : function()
  {
    this.base(arguments);

    // add blocker
    this.__blocker = new qx.ui.core.Blocker(this);
  },

  members :
  {
    __columnMenuButtons : null,
    __blocker : null,

    // Documented in qx.ui.table.IColumnMenu
    factory : function(item, options)
    {
      switch(item)
      {
        case "menu":
          var menu = new qx.ui.menu.Menu();
          this.setMenu(menu);
          return menu;

        case "menu-button":
          var menuButton =
            new qx.ui.table.columnmenu.MenuItem(options.text);
          menuButton.setVisible(options.bVisible);
          this.getMenu().add(menuButton);
          return menuButton;

        case "user-button":
          var button = new qx.ui.menu.Button(options.text);
          button.set(
            {
              appearance: "table-column-reset-button"
            });
          return button;

        case "separator":
          return new qx.ui.menu.Separator();

        default:
          throw new Error("Unrecognized factory request: " + item);
      }
    },


    /**
     * Returns the blocker of the columnmenu button.
     *
     * @return {qx.ui.core.Blocker} the blocker.
     */
    getBlocker : function() {
      return this.__blocker;
    },

    // Documented in qx.ui.table.IColumnMenu
    empty : function()
    {
      var menu = this.getMenu();
      var entries = menu.getChildren();

      for (var i=0,l=entries.length; i<l; i++)
      {
        entries[0].destroy();
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct: function() {
    this.__blocker.dispose();
  }

});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Interface for a column menu item corresponding to a table column.
 */
qx.Interface.define("qx.ui.table.IColumnMenuItem",
{
  properties :
  {
    /**
     * Whether the table column associated with this menu item is visible
     */
    visible : { }
  },

  events :
  {
    /**
     * Dispatched when a column changes visibility state. The event data is a
     * boolean indicating whether the table column associated with this menu
     * item is now visible.
     */
    changeVisible : "qx.event.type.Data"
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
 * Form interface for all form widgets which have boolean as their primary
 * data type like a checkbox.
 */
qx.Interface.define("qx.ui.form.IBooleanForm",
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
     * @param value {Boolean|null} The new value of the element.
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
     * @return {Boolean|null} The value.
     */
    getValue : function() {}
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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Renders a special checkbox button inside a menu. The button behaves like
 * a normal {@link qx.ui.form.CheckBox} and shows a check icon when
 * checked; normally shows no icon when not checked (depends on the theme).
 */
qx.Class.define("qx.ui.menu.CheckBox",
{
  extend : qx.ui.menu.AbstractButton,
  implement : [qx.ui.form.IBooleanForm],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct : function(label, menu)
  {
    this.base(arguments);

    // Initialize with incoming arguments
    if (label != null) {
      // try to translate every time you create a checkbox [BUG #2699]
      if (label.translate) {
        this.setLabel(label.translate());
      } else {
        this.setLabel(label);
      }
    }

    if (menu != null) {
      this.setMenu(menu);
    }

    this.addListener("execute", this._onExecute, this);
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
      init : "menu-checkbox"
    },

    /** Whether the button is checked */
    value :
    {
      check : "Boolean",
      init : false,
      apply : "_applyValue",
      event : "changeValue",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden (from MExecutable to keet the icon out of the binding)
    /**
     * @lint ignoreReferenceField(_bindableProperties)
     */
    _bindableProperties :
    [
      "enabled",
      "label",
      "toolTipText",
      "value",
      "menu"
    ],

    // property apply
    _applyValue : function(value, old)
    {
      value ?
        this.addState("checked") :
        this.removeState("checked");
    },


    /**
     * Handler for the execute event.
     *
     * @param e {qx.event.type.Event} The execute event.
     */
    _onExecute : function(e) {
      this.toggleValue();
    },


    // overridden
    _onClick : function(e)
    {
      if (e.isLeftPressed()) {
        this.execute();
      } else {
        // don't close menus if the button has a context menu
        if (this.getContextMenu()) {
          return;
        }
      }
      qx.ui.menu.Manager.getInstance().hideAll();
    },


    // overridden
    _onKeyPress : function(e) {
      this.execute();
    }
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A menu item.
 */
qx.Class.define("qx.ui.table.columnmenu.MenuItem",
{
  extend     : qx.ui.menu.CheckBox,
  implement  : qx.ui.table.IColumnMenuItem,

  properties :
  {
    /**
     * Whether the table column associated with this menu item is visible.
     */
    visible :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyVisible",
      event : "changeVisible"
    }
  },

  /**
   * Create a new instance of an item for insertion into the table column
   * visibility menu.
   *
   * @param text {String}
   *   Text for the menu item, most typically the name of the column in the
   *   table.
   */
  construct : function(text)
  {
    this.base(arguments, text);

    // Mirror native "value" property in our "visible" property
    this.addListener("changeValue",
                     function(e)
                     {
                       this.bInListener = true;
                       this.setVisible(e.getData());
                       this.bInListener = false;
                     });
  },

  members :
  {
    __bInListener : false,

    /**
     * Keep menu in sync with programmatic changes of visibility
     *
     * @param value {Boolean}
     *   New visibility value
     *
     * @param old {Boolean}
     *   Previous visibility value
     */
    _applyVisible : function(value, old)
    {
      // avoid recursion if called from listener on "changeValue" property
      if (! this.bInListener)
      {
        this.setValue(value);
      }
    }
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

************************************************************************ */

/**
 * A selection manager. This is a helper class that handles all selection
 * related events and updates a SelectionModel.
 * <p>
 * Widgets that support selection should use this manager. This way the only
 * thing the widget has to do is mapping mouse or key events to indexes and
 * call the corresponding handler method.
 *
 * @see SelectionModel
 */
qx.Class.define("qx.ui.table.selection.Manager",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The selection model where to set the selection changes.
     */
    selectionModel :
    {
      check : "qx.ui.table.selection.Model"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastMouseDownHandled : null,


    /**
     * Handles the mouse down event.
     *
     * @param index {Integer} the index the mouse is pointing at.
     * @param evt {Map} the mouse event.
     * @return {void}
     */
    handleMouseDown : function(index, evt)
    {
      if (evt.isLeftPressed())
      {
        var selectionModel = this.getSelectionModel();

        if (!selectionModel.isSelectedIndex(index))
        {
          // This index is not selected -> We react when the mouse is pressed (because of drag and drop)
          this._handleSelectEvent(index, evt);
          this.__lastMouseDownHandled = true;
        }
        else
        {
          // This index is already selected -> We react when the mouse is released (because of drag and drop)
          this.__lastMouseDownHandled = false;
        }
      }
      else if (evt.isRightPressed() && evt.getModifiers() == 0)
      {
        var selectionModel = this.getSelectionModel();

        if (!selectionModel.isSelectedIndex(index))
        {
          // This index is not selected -> Set the selection to this index
          selectionModel.setSelectionInterval(index, index);
        }
      }
    },


    /**
     * Handles the mouse up event.
     *
     * @param index {Integer} the index the mouse is pointing at.
     * @param evt {Map} the mouse event.
     * @return {void}
     */
    handleMouseUp : function(index, evt)
    {
      if (evt.isLeftPressed() && !this.__lastMouseDownHandled) {
        this._handleSelectEvent(index, evt);
      }
    },


    /**
     * Handles the mouse click event.
     *
     * @param index {Integer} the index the mouse is pointing at.
     * @param evt {Map} the mouse event.
     * @return {void}
     */
    handleClick : function(index, evt) {},


    /**
     * Handles the key down event that is used as replacement for mouse clicks
     * (Normally space).
     *
     * @param index {Integer} the index that is currently focused.
     * @param evt {Map} the key event.
     * @return {void}
     */
    handleSelectKeyDown : function(index, evt) {
      this._handleSelectEvent(index, evt);
    },


    /**
     * Handles a key down event that moved the focus (E.g. up, down, home, end, ...).
     *
     * @param index {Integer} the index that is currently focused.
     * @param evt {Map} the key event.
     * @return {void}
     */
    handleMoveKeyDown : function(index, evt)
    {
      var selectionModel = this.getSelectionModel();

      switch(evt.getModifiers())
      {
        case 0:
          selectionModel.setSelectionInterval(index, index);
          break;

        case qx.event.type.Dom.SHIFT_MASK:
          var anchor = selectionModel.getAnchorSelectionIndex();

          if (anchor == -1) {
            selectionModel.setSelectionInterval(index, index);
          } else {
            selectionModel.setSelectionInterval(anchor, index);
          }

          break;
      }
    },


    /**
     * Handles a select event.
     *
     * @param index {Integer} the index the event is pointing at.
     * @param evt {Map} the mouse event.
     * @return {void}
     */
    _handleSelectEvent : function(index, evt)
    {
      var selectionModel = this.getSelectionModel();

      var leadIndex = selectionModel.getLeadSelectionIndex();
      var anchorIndex = selectionModel.getAnchorSelectionIndex();

      if (evt.isShiftPressed())
      {
        if (index != leadIndex || selectionModel.isSelectionEmpty())
        {
          // The lead selection index was changed
          if (anchorIndex == -1) {
            anchorIndex = index;
          }

          if (evt.isCtrlOrCommandPressed()) {
            selectionModel.addSelectionInterval(anchorIndex, index);
          } else {
            selectionModel.setSelectionInterval(anchorIndex, index);
          }
        }
      }
      else if (evt.isCtrlOrCommandPressed())
      {
        if (selectionModel.isSelectedIndex(index)) {
          selectionModel.removeSelectionInterval(index, index);
        } else {
          selectionModel.addSelectionInterval(index, index);
        }
      }
      else
      {
        // setSelectionInterval checks to see if the change is really necessary
        selectionModel.setSelectionInterval(index, index);
      }
    }
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
     * David Perez Carmona (david-perez)

************************************************************************ */

/**
 * A selection model.
 */
qx.Class.define("qx.ui.table.selection.Model",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__selectedRangeArr = [];
    this.__anchorSelectionIndex = -1;
    this.__leadSelectionIndex = -1;
    this.hasBatchModeRefCount = 0;
    this.__hadChangeEventInBatchMode = false;
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** Fired when the selection has changed. */
    "changeSelection" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} The selection mode "none". Nothing can ever be selected. */
    NO_SELECTION                : 1,

    /** {int} The selection mode "single". This mode only allows one selected item. */
    SINGLE_SELECTION            : 2,


    /**
     * (int) The selection mode "single interval". This mode only allows one
     * continuous interval of selected items.
     */
    SINGLE_INTERVAL_SELECTION   : 3,


    /**
     * (int) The selection mode "multiple interval". This mode only allows any
     * selection.
     */
    MULTIPLE_INTERVAL_SELECTION : 4,


    /**
     * (int) The selection mode "multiple interval". This mode only allows any
     * selection. The difference with the previous one, is that multiple
     * selection is eased. A click on an item, toggles its selection state.
     * On the other hand, MULTIPLE_INTERVAL_SELECTION does this behavior only
     * when Ctrl-clicking an item.
     */
    MULTIPLE_INTERVAL_SELECTION_TOGGLE : 5
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Set the selection mode. Valid values are {@link #NO_SELECTION},
     * {@link #SINGLE_SELECTION}, {@link #SINGLE_INTERVAL_SELECTION},
     * {@link #MULTIPLE_INTERVAL_SELECTION} and
     * {@link #MULTIPLE_INTERVAL_SELECTION_TOGGLE}.
     */
    selectionMode :
    {
      init : 2, //SINGLE_SELECTION,
      check : [1,2,3,4,5],
      //[ NO_SELECTION, SINGLE_SELECTION, SINGLE_INTERVAL_SELECTION, MULTIPLE_INTERVAL_SELECTION, MULTIPLE_INTERVAL_SELECTION_TOGGLE ],
      apply : "_applySelectionMode"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __hadChangeEventInBatchMode : null,
    __anchorSelectionIndex : null,
    __leadSelectionIndex : null,
    __selectedRangeArr : null,


    // selectionMode property modifier
    _applySelectionMode : function(selectionMode) {
      this.resetSelection();
    },


    /**
     *
     * Activates / Deactivates batch mode. In batch mode, no change events will be thrown but
     * will be collected instead. When batch mode is turned off again and any events have
     * been collected, one event is thrown to inform the listeners.
     *
     * This method supports nested calling, i. e. batch mode can be turned more than once.
     * In this case, batch mode will not end until it has been turned off once for each
     * turning on.
     *
     * @param batchMode {Boolean} true to activate batch mode, false to deactivate
     * @return {Boolean} true if batch mode is active, false otherwise
     * @throws Error if batch mode is turned off once more than it has been turned on
     */
    setBatchMode : function(batchMode)
    {
      if (batchMode) {
        this.hasBatchModeRefCount += 1;
      }
      else
      {
        if (this.hasBatchModeRefCount == 0) {
          throw new Error("Try to turn off batch mode althoug it was not turned on.");
        }

        this.hasBatchModeRefCount -= 1;

        if (this.__hadChangeEventInBatchMode)
        {
          this.__hadChangeEventInBatchMode = false;
          this._fireChangeSelection();
        }
      }

      return this.hasBatchMode();
    },


    /**
     *
     * Returns whether batch mode is active. See setter for a description of batch mode.
     *
     * @return {Boolean} true if batch mode is active, false otherwise
     */
    hasBatchMode : function() {
      return this.hasBatchModeRefCount > 0;
    },


    /**
     * Returns the first argument of the last call to {@link #setSelectionInterval()},
     * {@link #addSelectionInterval()} or {@link #removeSelectionInterval()}.
     *
     * @return {Integer} the anchor selection index.
     */
    getAnchorSelectionIndex : function() {
      return this.__anchorSelectionIndex;
    },


    /**
     * Sets the anchor selection index. Only use this function, if you want manipulate
     * the selection manually.
     *
     * @param index {Integer} the index to set.
     */
    _setAnchorSelectionIndex : function(index) {
      this.__anchorSelectionIndex = index;
    },


    /**
     * Returns the second argument of the last call to {@link #setSelectionInterval()},
     * {@link #addSelectionInterval()} or {@link #removeSelectionInterval()}.
     *
     * @return {Integer} the lead selection index.
     */
    getLeadSelectionIndex : function() {
      return this.__leadSelectionIndex;
    },


    /**
     * Sets the lead selection index. Only use this function, if you want manipulate
     * the selection manually.
     *
     * @param index {Integer} the index to set.
     */
    _setLeadSelectionIndex : function(index) {
      this.__leadSelectionIndex = index;
    },


    /**
     * Returns an array that holds all the selected ranges of the table. Each
     * entry is a map holding information about the "minIndex" and "maxIndex" of the
     * selection range.
     *
     * @return {Map[]} array with all the selected ranges.
     */
    _getSelectedRangeArr : function() {
      return this.__selectedRangeArr;
    },


    /**
     * Resets (clears) the selection.
     */
    resetSelection : function()
    {
      if (!this.isSelectionEmpty())
      {
        this._resetSelection();
        this._fireChangeSelection();
      }
    },


    /**
     * Returns whether the selection is empty.
     *
     * @return {Boolean} whether the selection is empty.
     */
    isSelectionEmpty : function() {
      return this.__selectedRangeArr.length == 0;
    },


    /**
     * Returns the number of selected items.
     *
     * @return {Integer} the number of selected items.
     */
    getSelectedCount : function()
    {
      var selectedCount = 0;

      for (var i=0; i<this.__selectedRangeArr.length; i++)
      {
        var range = this.__selectedRangeArr[i];
        selectedCount += range.maxIndex - range.minIndex + 1;
      }

      return selectedCount;
    },


    /**
     * Returns whether an index is selected.
     *
     * @param index {Integer} the index to check.
     * @return {Boolean} whether the index is selected.
     */
    isSelectedIndex : function(index)
    {
      for (var i=0; i<this.__selectedRangeArr.length; i++)
      {
        var range = this.__selectedRangeArr[i];

        if (index >= range.minIndex && index <= range.maxIndex) {
          return true;
        }
      }

      return false;
    },


    /**
     * Returns the selected ranges as an array. Each array element has a
     * <code>minIndex</code> and a <code>maxIndex</code> property.
     *
     * @return {Map[]} the selected ranges.
     */
    getSelectedRanges : function()
    {
      // clone the selection array and the individual elements - this prevents the
      // caller from messing with the internal model
      var retVal = [];

      for (var i=0; i<this.__selectedRangeArr.length; i++)
      {
        retVal.push(
        {
          minIndex : this.__selectedRangeArr[i].minIndex,
          maxIndex : this.__selectedRangeArr[i].maxIndex
        });
      }

      return retVal;
    },


    /**
     * Calls an iterator function for each selected index.
     *
     * Usage Example:
     * <pre class='javascript'>
     * var selectedRowData = [];
     * mySelectionModel.iterateSelection(function(index) {
     *   selectedRowData.push(myTableModel.getRowData(index));
     * });
     * </pre>
     *
     * @param iterator {Function} the function to call for each selected index.
     *          Gets the current index as parameter.
     * @param object {var ? null} the object to use when calling the handler.
     *          (this object will be available via "this" in the iterator)
     * @return {void}
     */
    iterateSelection : function(iterator, object)
    {
      for (var i=0; i<this.__selectedRangeArr.length; i++)
      {
        for (var j=this.__selectedRangeArr[i].minIndex; j<=this.__selectedRangeArr[i].maxIndex; j++) {
          iterator.call(object, j);
        }
      }
    },


    /**
     * Sets the selected interval. This will clear the former selection.
     *
     * @param fromIndex {Integer} the first index of the selection (including).
     * @param toIndex {Integer} the last index of the selection (including).
     * @return {void}
     */
    setSelectionInterval : function(fromIndex, toIndex)
    {
      var me = this.self(arguments);

      switch(this.getSelectionMode())
      {
        case me.NO_SELECTION:
          return;

        case me.SINGLE_SELECTION:
          // Ensure there is actually a change of selection
          if (this.isSelectedIndex(toIndex)) {
            return;
          }

          fromIndex = toIndex;
          break;

        case me.MULTIPLE_INTERVAL_SELECTION_TOGGLE:
          this.setBatchMode(true);
          try
          {
            for (var i = fromIndex; i <= toIndex; i++)
            {
              if (!this.isSelectedIndex(i))
              {
                this._addSelectionInterval(i, i);
              }
              else
              {
                this.removeSelectionInterval(i, i);
              }
            }
          }
          catch (e)
          {
            // IE doesn't execute the "finally" block if no "catch" block is present
            // this hack is used to fix [BUG #3688]
            if (
              qx.core.Environment.get("browser.name") == 'ie' &&
              qx.core.Environment.get("browser.version") <= 7
            ) {
              this.setBatchMode(false);
            }
            throw e;
          }
          finally {
            this.setBatchMode(false);
          }
          this._fireChangeSelection();
          return;
      }

      this._resetSelection();
      this._addSelectionInterval(fromIndex, toIndex);

      this._fireChangeSelection();
    },


    /**
     * Adds a selection interval to the current selection.
     *
     * @param fromIndex {Integer} the first index of the selection (including).
     * @param toIndex {Integer} the last index of the selection (including).
     * @return {void}
     */
    addSelectionInterval : function(fromIndex, toIndex)
    {
      var SelectionModel = qx.ui.table.selection.Model;

      switch(this.getSelectionMode())
      {
        case SelectionModel.NO_SELECTION:
          return;

        case SelectionModel.MULTIPLE_INTERVAL_SELECTION:
        case SelectionModel.MULTIPLE_INTERVAL_SELECTION_TOGGLE:
          this._addSelectionInterval(fromIndex, toIndex);
          this._fireChangeSelection();
          break;

        default:
          this.setSelectionInterval(fromIndex, toIndex);
          break;
      }
    },


    /**
     * Removes an interval from the current selection.
     *
     * @param fromIndex {Integer} the first index of the interval (including).
     * @param toIndex {Integer} the last index of the interval (including).
     * @return {void}
     */
    removeSelectionInterval : function(fromIndex, toIndex)
    {
      this.__anchorSelectionIndex = fromIndex;
      this.__leadSelectionIndex = toIndex;

      var minIndex = Math.min(fromIndex, toIndex);
      var maxIndex = Math.max(fromIndex, toIndex);

      // Crop the affected ranges
      for (var i=0; i<this.__selectedRangeArr.length; i++)
      {
        var range = this.__selectedRangeArr[i];

        if (range.minIndex > maxIndex)
        {
          // We are done
          break;
        }
        else if (range.maxIndex >= minIndex)
        {
          // This range is affected
          var minIsIn = (range.minIndex >= minIndex) && (range.minIndex <= maxIndex);
          var maxIsIn = (range.maxIndex >= minIndex) && (range.maxIndex <= maxIndex);

          if (minIsIn && maxIsIn)
          {
            // This range is removed completely
            this.__selectedRangeArr.splice(i, 1);

            // Check this index another time
            i--;
          }
          else if (minIsIn)
          {
            // The range is cropped from the left
            range.minIndex = maxIndex + 1;
          }
          else if (maxIsIn)
          {
            // The range is cropped from the right
            range.maxIndex = minIndex - 1;
          }
          else
          {
            // The range is split
            var newRange =
            {
              minIndex : maxIndex + 1,
              maxIndex : range.maxIndex
            };

            this.__selectedRangeArr.splice(i + 1, 0, newRange);

            range.maxIndex = minIndex - 1;

            // We are done
            break;
          }
        }
      }

      // this._dumpRanges();
      this._fireChangeSelection();
    },


    /**
     * Resets (clears) the selection, but doesn't inform the listeners.
     */
    _resetSelection : function()
    {
      this.__selectedRangeArr = [];
      this.__anchorSelectionIndex = -1;
      this.__leadSelectionIndex = -1;
    },


    /**
     * Adds a selection interval to the current selection, but doesn't inform
     * the listeners.
     *
     * @param fromIndex {Integer} the first index of the selection (including).
     * @param toIndex {Integer} the last index of the selection (including).
     * @return {void}
     */
    _addSelectionInterval : function(fromIndex, toIndex)
    {
      this.__anchorSelectionIndex = fromIndex;
      this.__leadSelectionIndex = toIndex;

      var minIndex = Math.min(fromIndex, toIndex);
      var maxIndex = Math.max(fromIndex, toIndex);

      // Find the index where the new range should be inserted
      var newRangeIndex = 0;

      for (;newRangeIndex<this.__selectedRangeArr.length; newRangeIndex++)
      {
        var range = this.__selectedRangeArr[newRangeIndex];

        if (range.minIndex > minIndex) {
          break;
        }
      }

      // Add the new range
      this.__selectedRangeArr.splice(newRangeIndex, 0,
      {
        minIndex : minIndex,
        maxIndex : maxIndex
      });

      // Merge overlapping ranges
      var lastRange = this.__selectedRangeArr[0];

      for (var i=1; i<this.__selectedRangeArr.length; i++)
      {
        var range = this.__selectedRangeArr[i];

        if (lastRange.maxIndex + 1 >= range.minIndex)
        {
          // The ranges are overlapping -> merge them
          lastRange.maxIndex = Math.max(lastRange.maxIndex, range.maxIndex);

          // Remove the current range
          this.__selectedRangeArr.splice(i, 1);

          // Check this index another time
          i--;
        }
        else
        {
          lastRange = range;
        }
      }
    },

    // this._dumpRanges();
    /**
     * Logs the current ranges for debug perposes.
     *
     * @return {void}
     */
    _dumpRanges : function()
    {
      var text = "Ranges:";

      for (var i=0; i<this.__selectedRangeArr.length; i++)
      {
        var range = this.__selectedRangeArr[i];
        text += " [" + range.minIndex + ".." + range.maxIndex + "]";
      }

      this.debug(text);
    },


    /**
     * Fires the "changeSelection" event to all registered listeners. If the selection model
     * currently is in batch mode, only one event will be thrown when batch mode is ended.
     *
     * @return {void}
     */
    _fireChangeSelection : function()
    {
      if (this.hasBatchMode())
      {
        // In batch mode, remember event but do not throw (yet)
        this.__hadChangeEventInBatchMode = true;
      }
      else
      {
        // If not in batch mode, throw event
        this.fireEvent("changeSelection");
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__selectedRangeArr = null;
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The table pane that shows a certain section from a table. This class handles
 * the display of the data part of a table and is therefore the base for virtual
 * scrolling.
 */
qx.Class.define("qx.ui.table.pane.Pane",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {qx.ui.table.pane.Scroller} the TablePaneScroller the header belongs to.
   */
  construct : function(paneScroller)
  {
    this.base(arguments);

    this.__paneScroller = paneScroller;

    this.__lastColCount = 0;
    this.__lastRowCount = 0;

    this.__rowCache = [];
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */


  events :
  {
    /**
     * Whether the current view port of the pane has not loaded data.
     * The data object of the event indicates if the table pane has to reload
     * data or not. Can be used to give the user feedback of the loading state
     * of the rows.
     */
    "paneReloadsData" : "qx.event.type.Data",

    /**
     * Whenever the content of the table panehas been updated (rendered)
     * trigger a paneUpdated event. This allows the canvas cellrenderer to act
     * once the new cells have been integrated in the dom.
     */
    "paneUpdated" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The index of the first row to show. */
    firstVisibleRow :
    {
      check : "Number",
      init : 0,
      apply : "_applyFirstVisibleRow"
    },


    /** The number of rows to show. */
    visibleRowCount :
    {
      check : "Number",
      init : 0,
      apply : "_applyVisibleRowCount"
    },


    /**
     * Maximum number of cached rows. If the value is <code>-1</code> the cache
     * size is unlimited
     */
    maxCacheLines :
    {
      check : "Number",
      init : 1000,
      apply : "_applyMaxCacheLines"
    },

    // overridden
    allowShrinkX :
    {
      refine : true,
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastRowCount : null,
    __lastColCount : null,

    __paneScroller : null,
    __tableContainer : null,

    __focusedRow : null,
    __focusedCol : null,

    // sparse array to cache rendered rows
    __rowCache : null,
    __rowCacheCount : 0,


    // property modifier
    _applyFirstVisibleRow : function(value, old) {
      this.updateContent(false, value-old);
    },


    // property modifier
    _applyVisibleRowCount : function(value, old) {
      this.updateContent(true);
    },


    // overridden
    _getContentHint : function()
    {
      // the preferred height is 400 pixel. We don't use rowCount * rowHeight
      // because this is typically too large.
      return {
        width: this.getPaneScroller().getTablePaneModel().getTotalWidth(),
        height: 400
      }
    },


    /**
     * Returns the TablePaneScroller this pane belongs to.
     *
     * @return {qx.ui.table.pane.Scroller} the TablePaneScroller.
     */
    getPaneScroller : function() {
      return this.__paneScroller;
    },


    /**
     * Returns the table this pane belongs to.
     *
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this.__paneScroller.getTable();
    },


    /**
     * Sets the currently focused cell.
     *
     * @param col {Integer?null} the model index of the focused cell's column.
     * @param row {Integer?null} the model index of the focused cell's row.
     * @param massUpdate {Boolean ? false} Whether other updates are planned as well.
     *          If true, no repaint will be done.
     * @return {void}
     */
    setFocusedCell : function(col, row, massUpdate)
    {
      if (col != this.__focusedCol || row != this.__focusedRow)
      {
        var oldRow = this.__focusedRow;
        this.__focusedCol = col;
        this.__focusedRow = row;

        // Update the focused row background
        if (row != oldRow && !massUpdate)
        {
          if (oldRow !== null) {
            this.updateContent(false, null, oldRow, true);
          }
          if (row !== null) {
            this.updateContent(false, null, row, true);
          }
        }
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     */
    onSelectionChanged : function() {
      this.updateContent(false, null, null, true);
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     */
    onFocusChanged : function() {
      this.updateContent(false, null, null, true);
    },


    /**
     * Sets the column width.
     *
     * @param col {Integer} the column to change the width for.
     * @param width {Integer} the new width.
     * @return {void}
     */
    setColumnWidth : function(col, width) {
      this.updateContent(true);
    },


    /**
     * Event handler. Called the column order has changed.
     *
     * @return {void}
     */
    onColOrderChanged : function() {
      this.updateContent(true);
    },


    /**
     * Event handler. Called when the pane model has changed.
     */
    onPaneModelChanged : function() {
      this.updateContent(true);
    },


    /**
     * Event handler. Called when the table model data has changed.
     *
     * @param firstRow {Integer} The index of the first row that has changed.
     * @param lastRow {Integer} The index of the last row that has changed.
     * @param firstColumn {Integer} The model index of the first column that has changed.
     * @param lastColumn {Integer} The model index of the last column that has changed.
     */
    onTableModelDataChanged : function(firstRow, lastRow, firstColumn, lastColumn)
    {
      this.__rowCacheClear();

      var paneFirstRow = this.getFirstVisibleRow();
      var rowCount = this.getVisibleRowCount();

      if (lastRow == -1 || lastRow >= paneFirstRow && firstRow < paneFirstRow + rowCount)
      {
        // The change intersects this pane
        this.updateContent();
      }
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @return {void}
     */
    onTableModelMetaDataChanged : function() {
      this.updateContent(true);
    },


    // property apply method
    _applyMaxCacheLines : function(value, old)
    {
      if (this.__rowCacheCount >= value && value !== -1) {
        this.__rowCacheClear();
      }
    },


    /**
     * Clear the row cache
     */
    __rowCacheClear : function()
    {
      this.__rowCache = [];
      this.__rowCacheCount = 0;
    },


    /**
     * Get a line from the row cache.
     *
     * @param row {Integer} Row index to get
     * @param selected {Boolean} Whether the row is currently selected
     * @param focused {Boolean} Whether the row is currently focused
     * @return {String|null} The cached row or null if a row with the given
     *     index is not cached.
     */
    __rowCacheGet : function(row, selected, focused)
    {
      if (!selected && !focused && this.__rowCache[row]) {
        return this.__rowCache[row];
      } else {
        return null;
      }
    },


    /**
     * Add a line to the row cache.
     *
     * @param row {Integer} Row index to set
     * @param rowString {String} computed row string to cache
     * @param selected {Boolean} Whether the row is currently selected
     * @param focused {Boolean} Whether the row is currently focused
     */
    __rowCacheSet : function(row, rowString, selected, focused)
    {
      var maxCacheLines = this.getMaxCacheLines();
      if (
        !selected &&
        !focused &&
        !this.__rowCache[row] &&
        maxCacheLines > 0
      ) {
        this._applyMaxCacheLines(maxCacheLines);
        this.__rowCache[row] = rowString;
        this.__rowCacheCount += 1;
      }
    },


    /**
     * Updates the content of the pane.
     *
     * @param completeUpdate {Boolean ? false} if true a complete update is performed.
     *      On a complete update all cell widgets are recreated.
     * @param scrollOffset {Integer ? null} If set specifies how many rows to scroll.
     * @param onlyRow {Integer ? null} if set only the specified row will be updated.
     * @param onlySelectionOrFocusChanged {Boolean ? false} if true, cell values won't
     *          be updated. Only the row background will.
     * @return {void}
     */
    updateContent : function(completeUpdate, scrollOffset, onlyRow, onlySelectionOrFocusChanged)
    {
      if (completeUpdate) {
        this.__rowCacheClear();
      }

      //var start = new Date();

      if (scrollOffset && Math.abs(scrollOffset) <= Math.min(10, this.getVisibleRowCount()))
      {
        //this.debug("scroll", scrollOffset);
        this._scrollContent(scrollOffset);
      }
      else if (onlySelectionOrFocusChanged && !this.getTable().getAlwaysUpdateCells())
      {
        //this.debug("update row styles");
        this._updateRowStyles(onlyRow);
      }
      else
      {
        //this.debug("full update");
        this._updateAllRows();
      }

      //this.debug("render time: " + (new Date() - start) + "ms");
    },


    /**
     * If only focus or selection changes it is sufficient to only update the
     * row styles. This method updates the row styles of all visible rows or
     * of just one row.
     *
     * @param onlyRow {Integer|null ? null} If this parameter is set only the row
     *     with this index is updated.
     */
    _updateRowStyles : function(onlyRow)
    {
      var elem = this.getContentElement().getDomElement();

      if (!elem || !elem.firstChild) {
        this._updateAllRows();
        return;
      }

      var table = this.getTable();
      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var rowRenderer = table.getDataRowRenderer();
      var rowNodes = elem.firstChild.childNodes;
      var cellInfo = { table : table };

      // We don't want to execute the row loop below more than necessary. If
      // onlyrow is not null, we want to do the loop only for that row.
      // In that case, we start at (set the "row" variable to) that row, and
      // stop at (set the "end" variable to the offset of) the next row.
      var row = this.getFirstVisibleRow();
      var y = 0;

      // How many rows do we need to update?
      var end = rowNodes.length;

      if (onlyRow != null)
      {
        // How many rows are we skipping?
        var offset = onlyRow - row;
        if (offset >= 0 && offset < end)
        {
          row = onlyRow;
          y = offset;
          end = offset + 1;
        } else
        {
          return;
        }
      }

      for (; y<end; y++, row++)
      {
        cellInfo.row = row;
        cellInfo.selected = selectionModel.isSelectedIndex(row);
        cellInfo.focusedRow = (this.__focusedRow == row);
        cellInfo.rowData = tableModel.getRowData(row);

        rowRenderer.updateDataRowElement(cellInfo, rowNodes[y]);
      };
    },


    /**
     * Get the HTML table fragment for the given row range.
     *
     * @param firstRow {Integer} Index of the first row
     * @param rowCount {Integer} Number of rows
     * @return {String} The HTML table fragment for the given row range.
     */
    _getRowsHtml : function(firstRow, rowCount)
    {
      var table = this.getTable();

      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();
      var rowRenderer = table.getDataRowRenderer();

      tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);

      var rowHeight = table.getRowHeight();
      var colCount = paneModel.getColumnCount();
      var left = 0;
      var cols = [];

      // precompute column properties
      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        var cellWidth = columnModel.getColumnWidth(col);
        cols.push({
          col: col,
          xPos: x,
          editable: tableModel.isColumnEditable(col),
          focusedCol: this.__focusedCol == col,
          styleLeft: left,
          styleWidth: cellWidth
        });

        left += cellWidth;
      }

      var rowsArr = [];
      var paneReloadsData = false;
      for (var row=firstRow; row < firstRow + rowCount; row++)
      {
        var selected = selectionModel.isSelectedIndex(row);
        var focusedRow = (this.__focusedRow == row);

        var cachedRow = this.__rowCacheGet(row, selected, focusedRow);
        if (cachedRow) {
          rowsArr.push(cachedRow);
          continue;
        }

        var rowHtml = [];

        var cellInfo = { table : table };
        cellInfo.styleHeight = rowHeight;

        cellInfo.row = row;
        cellInfo.selected = selected;
        cellInfo.focusedRow = focusedRow;
        cellInfo.rowData = tableModel.getRowData(row);

        if (!cellInfo.rowData) {
          paneReloadsData = true;
        }

        rowHtml.push('<div ');

        var rowAttributes = rowRenderer.getRowAttributes(cellInfo);
        if (rowAttributes) {
          rowHtml.push(rowAttributes);
        }

        var rowClass = rowRenderer.getRowClass(cellInfo);
        if (rowClass) {
          rowHtml.push('class="', rowClass, '" ');
        }

        var rowStyle = rowRenderer.createRowStyle(cellInfo);
        rowStyle += ";position:relative;" + rowRenderer.getRowHeightStyle(rowHeight)+ "width:100%;";
        if (rowStyle) {
          rowHtml.push('style="', rowStyle, '" ');
        }
        rowHtml.push('>');

        var stopLoop = false;
        for (x=0; x<colCount && !stopLoop; x++)
        {
          var col_def = cols[x];
          for (var attr in col_def) {
            cellInfo[attr] = col_def[attr];
          }
          var col = cellInfo.col;

          // Use the "getValue" method of the tableModel to get the cell's
          // value working directly on the "rowData" object
          // (-> cellInfo.rowData[col];) is not a solution because you can't
          // work with the columnIndex -> you have to use the columnId of the
          // columnIndex This is exactly what the method "getValue" does
          cellInfo.value = tableModel.getValue(col, row);
          var cellRenderer = columnModel.getDataCellRenderer(col);

          // Retrieve the current default cell style for this column.
          cellInfo.style = cellRenderer.getDefaultCellStyle();

          // Allow a cell renderer to tell us not to draw any further cells in
          // the row. Older, or traditional cell renderers don't return a
          // value, however, from createDataCellHtml, so assume those are
          // returning false.
          //
          // Tested with http://tinyurl.com/333hyhv
          stopLoop =
            cellRenderer.createDataCellHtml(cellInfo, rowHtml) || false;
        }
        rowHtml.push('</div>');

        var rowString = rowHtml.join("");

        this.__rowCacheSet(row, rowString, selected, focusedRow);
        rowsArr.push(rowString);
      }
      this.fireDataEvent("paneReloadsData", paneReloadsData);
      return rowsArr.join("");
    },


    /**
     * Scrolls the pane's contents by the given offset.
     *
     * @param rowOffset {Integer} Number of lines to scroll. Scrolling up is
     *     represented by a negative offset.
     */
    _scrollContent : function(rowOffset)
    {
      var el = this.getContentElement().getDomElement();
      if (!(el && el.firstChild)) {
        this._updateAllRows();
        return;
      }

      var tableBody = el.firstChild;
      var tableChildNodes = tableBody.childNodes;
      var rowCount = this.getVisibleRowCount();
      var firstRow = this.getFirstVisibleRow();

      var tabelModel = this.getTable().getTableModel();
      var modelRowCount = 0;

      modelRowCount = tabelModel.getRowCount();

      // don't handle this special case here
      if (firstRow + rowCount > modelRowCount) {
        this._updateAllRows();
        return;
      }

      // remove old lines
      var removeRowBase = rowOffset < 0 ? rowCount + rowOffset : 0;
      var addRowBase = rowOffset < 0 ? 0: rowCount - rowOffset;

      for (i=Math.abs(rowOffset)-1; i>=0; i--)
      {
        var rowElem = tableChildNodes[removeRowBase];
        try {
          tableBody.removeChild(rowElem);
        } catch(exp) {
          break;
        }
      }

      // render new lines
      if (!this.__tableContainer) {
        this.__tableContainer = document.createElement("div");
      }
      var tableDummy = '<div>';
      tableDummy += this._getRowsHtml(firstRow + addRowBase, Math.abs(rowOffset));
      tableDummy += '</div>';
      this.__tableContainer.innerHTML = tableDummy;
      var newTableRows = this.__tableContainer.firstChild.childNodes;

      // append new lines
      if (rowOffset > 0)
      {
        for (var i=newTableRows.length-1; i>=0; i--)
        {
          var rowElem = newTableRows[0];
          tableBody.appendChild(rowElem);
        }
      }
      else
      {
        for (var i=newTableRows.length-1; i>=0; i--)
        {
          var rowElem = newTableRows[newTableRows.length-1];
          tableBody.insertBefore(rowElem, tableBody.firstChild);
        }
      }

      // update focus indicator
      if (this.__focusedRow !== null)
      {
        this._updateRowStyles(this.__focusedRow - rowOffset);
        this._updateRowStyles(this.__focusedRow);
      }
      this.fireEvent("paneUpdated");
    },


    /**
     * Updates the content of the pane (implemented using array joins).
     */
    _updateAllRows : function()
    {
      var elem = this.getContentElement().getDomElement();
      if (!elem) {
        // pane has not yet been rendered
        this.addListenerOnce("appear", arguments.callee, this);
        return;
      }

      var table = this.getTable();

      var tableModel = table.getTableModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();

      var colCount = paneModel.getColumnCount();
      var rowHeight = table.getRowHeight();
      var firstRow = this.getFirstVisibleRow();

      var rowCount = this.getVisibleRowCount();
      var modelRowCount = tableModel.getRowCount();

      if (firstRow + rowCount > modelRowCount) {
        rowCount = Math.max(0, modelRowCount - firstRow);
      }

      var rowWidth = paneModel.getTotalWidth();
      var htmlArr;

      // If there are any rows...
      if (rowCount > 0)
      {
        // ... then create a div for them and add the rows to it.
        htmlArr =
          [
            "<div style='",
            "width: 100%;",
            (table.getForceLineHeight()
             ? "line-height: " + rowHeight + "px;"
             : ""),
            "overflow: hidden;",
            "'>",
            this._getRowsHtml(firstRow, rowCount),
            "</div>"
          ];
      }
      else
      {
        // Otherwise, don't create the div, as even an empty div creates a
        // white row in IE.
        htmlArr = [];
      }

      var data = htmlArr.join("");
      elem.innerHTML = data;
      this.setWidth(rowWidth);

      this.__lastColCount = colCount;
      this.__lastRowCount = rowCount;
      this.fireEvent("paneUpdated");
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__tableContainer = this.__paneScroller = this.__rowCache = null;
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

************************************************************************ */

/**
 * Shows the header of a table.
 */
qx.Class.define("qx.ui.table.pane.Header",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {qx.ui.table.pane.Scroller} the TablePaneScroller the header belongs to.
   */
  construct : function(paneScroller)
  {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.HBox());

    // add blocker
    this.__blocker = new qx.ui.core.Blocker(this);

    this.__paneScroller = paneScroller;
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __paneScroller : null,
    __moveFeedback : null,
    __lastMouseOverColumn : null,
    __blocker : null,

    /**
     * Returns the TablePaneScroller this header belongs to.
     *
     * @return {qx.ui.table.pane.Scroller} the TablePaneScroller.
     */
    getPaneScroller : function() {
      return this.__paneScroller;
    },


    /**
     * Returns the table this header belongs to.
     *
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this.__paneScroller.getTable();
    },

    /**
     * Returns the blocker of the header.
     *
     * @return {qx.ui.core.Blocker} the blocker.
     */
    getBlocker : function() {
      return this.__blocker;
    },

    /**
     * Event handler. Called the column order has changed.
     *
     * @return {void}
     */
    onColOrderChanged : function() {
      this._updateContent(true);
    },


    /**
     * Event handler. Called when the pane model has changed.
     */
    onPaneModelChanged : function() {
      this._updateContent(true);
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @return {void}
     */
    onTableModelMetaDataChanged : function() {
      this._updateContent();
    },


    /**
     * Sets the column width. This overrides the width from the column model.
     *
     * @param col {Integer}
     *   The column to change the width for.
     *
     * @param width {Integer}
     *   The new width.
     *
     * @param isMouseAction {Boolean}
     *   <i>true</i> if the column width is being changed as a result of a
     *   mouse drag in the header; false or undefined otherwise.
     *
     * @return {void}
     */
    setColumnWidth : function(col, width, isMouseAction)
    {
      var child = this.getHeaderWidgetAtColumn(col);

      if (child != null) {
        child.setWidth(width);
      }
    },


    /**
     * Sets the column the mouse is currently over.
     *
     * @param col {Integer} the model index of the column the mouse is currently over or
     *      null if the mouse is over no column.
     * @return {void}
     */
    setMouseOverColumn : function(col)
    {
      if (col != this.__lastMouseOverColumn)
      {
        if (this.__lastMouseOverColumn != null)
        {
          var widget = this.getHeaderWidgetAtColumn(this.__lastMouseOverColumn);

          if (widget != null) {
            widget.removeState("hovered");
          }
        }

        if (col != null) {
          this.getHeaderWidgetAtColumn(col).addState("hovered");
        }

        this.__lastMouseOverColumn = col;
      }
    },


    /**
     * Get the header widget for the given column
     *
     * @param col {Integer} The column number
     * @return {qx.ui.table.headerrenderer.HeaderCell} The header cell widget
     */
    getHeaderWidgetAtColumn : function(col)
    {
      var xPos = this.getPaneScroller().getTablePaneModel().getX(col);
      return this._getChildren()[xPos];
    },


    /**
     * Shows the feedback shown while a column is moved by the user.
     *
     * @param col {Integer} the model index of the column to show the move feedback for.
     * @param x {Integer} the x position the left side of the feeback should have
     *      (in pixels, relative to the left side of the header).
     * @return {void}
     */
    showColumnMoveFeedback : function(col, x)
    {
      var pos = this.getContainerLocation();

      if (this.__moveFeedback == null)
      {
        var table = this.getTable();
        var xPos = this.getPaneScroller().getTablePaneModel().getX(col);
        var cellWidget = this._getChildren()[xPos];

        var tableModel = table.getTableModel();
        var columnModel = table.getTableColumnModel();

        var cellInfo =
        {
          xPos  : xPos,
          col   : col,
          name  : tableModel.getColumnName(col),
          table : table
        };

        var cellRenderer = columnModel.getHeaderCellRenderer(col);
        var feedback = cellRenderer.createHeaderCell(cellInfo);

        var size = cellWidget.getBounds();

        // Configure the feedback
        feedback.setWidth(size.width);
        feedback.setHeight(size.height);
        feedback.setZIndex(1000000);
        feedback.setOpacity(0.8);
        feedback.setLayoutProperties({top: pos.top});

        this.getApplicationRoot().add(feedback);
        this.__moveFeedback = feedback;
      }

      this.__moveFeedback.setLayoutProperties({left: pos.left + x});
      this.__moveFeedback.show();
    },


    /**
     * Hides the feedback shown while a column is moved by the user.
     */
    hideColumnMoveFeedback : function()
    {
      if (this.__moveFeedback != null)
      {
        this.__moveFeedback.destroy();
        this.__moveFeedback = null;
      }
    },


    /**
     * Returns whether the column move feedback is currently shown.
     *
     * @return {Boolean} <code>true</code> whether the column move feedback is
     *    currently shown, <code>false</code> otherwise.
     */
    isShowingColumnMoveFeedback : function() {
      return this.__moveFeedback != null;
    },


    /**
     * Updates the content of the header.
     *
     * @param completeUpdate {Boolean} if true a complete update is performed. On a
     *      complete update all header widgets are recreated.
     * @return {void}
     */
    _updateContent : function(completeUpdate)
    {
      var table = this.getTable();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();

      var children = this._getChildren();
      var colCount = paneModel.getColumnCount();

      var sortedColumn = tableModel.getSortColumnIndex();

      // Remove all widgets on the complete update
      if (completeUpdate) {
        this._cleanUpCells();
      }

      // Update the header
      var cellInfo = {};
      cellInfo.sortedAscending = tableModel.isSortAscending();

      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        if (col === undefined) {
          continue;
        }

        var colWidth = columnModel.getColumnWidth(col);

        // TODO: Get real cell renderer
        var cellRenderer = columnModel.getHeaderCellRenderer(col);

        cellInfo.xPos = x;
        cellInfo.col = col;
        cellInfo.name = tableModel.getColumnName(col);
        cellInfo.editable = tableModel.isColumnEditable(col);
        cellInfo.sorted = (col == sortedColumn);
        cellInfo.table = table;

        // Get the cached widget
        var cachedWidget = children[x];

        // Create or update the widget
        if (cachedWidget == null)
        {
          // We have no cached widget -> create it
          cachedWidget = cellRenderer.createHeaderCell(cellInfo);

          cachedWidget.set(
          {
            width  : colWidth
          });

          this._add(cachedWidget);
        }
        else
        {
          // This widget already created before -> recycle it
          cellRenderer.updateHeaderCell(cellInfo, cachedWidget);
        }

        // set the states
        if (x === 0) {
          cachedWidget.addState("first");
          cachedWidget.removeState("last");
        } else if (x === colCount - 1) {
          cachedWidget.removeState("first");
          cachedWidget.addState("last");
        } else {
          cachedWidget.removeState("first");
          cachedWidget.removeState("last");
        }
      }
    },


    /**
     * Cleans up all header cells.
     *
     * @return {void}
     */
    _cleanUpCells : function()
    {
      var children = this._getChildren();

      for (var x=children.length-1; x>=0; x--)
      {
        var cellWidget = children[x];
        cellWidget.destroy();
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__blocker.dispose();
    this._disposeObjects("__paneScroller");
  }
});
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Mustafa Sak (msak)

************************************************************************ */

/**
 * This mixin provides scrolling for scroller widgets.
 */
qx.Mixin.define("qx.ui.core.scroll.MTouchScroll",
{
  construct : function()
  {

    // touch move listener for touch scrolling
    this.addListener("touchmove", this._onTouchMove, this);

    // reset the delta on every touch session
    this.addListener("touchstart", this._onTouchStart, this);

    this.addListener("touchend", this._onTouchEnd, this, true);


    this.__old = {};
    this.__impulseTimerId = {};
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __momentum : false,
    __preventNextTouchEndEvent : false,
    __impulseTimerId : null,
    __old : null,



    /**
     * Returns true if touch momentum is currently on progress.
     *
     * @return {Boolean} true if in momentum
     */
    inTouchMomentum : function()
    {
      return this.__momentum;
    },


    /**
     * Handler for <code>touchstart</code> event. Clears timers and flags.
     *
     * @param e {qx.event.type.Touch} the touch event
     */
    _onTouchStart : function(e)
    {
      if(this.__impulseTimerId) {
        clearTimeout(this.__impulseTimerId.x);
        clearTimeout(this.__impulseTimerId.y);
      }

      this.__old = {"x": 0, "y": 0};
      if  (this.__momentum){
        this.__preventNextTouchEndEvent = true;
        this.__momentum = false;
      }
    },


    /**
     * Handler for touchend event. Stops event propagation if needed.
     *
     * @param e {qx.event.type.Touch} the touch event
     */
    _onTouchEnd : function(e)
    {
      if(this.__preventNextTouchEndEvent){
        this.__preventNextTouchEndEvent = false;
        e.stop();
      }
    },



    /**
     * Event handler for the touch move.
     *
     * @param e {qx.event.type.Touch} The touch event
     */
    _onTouchMove : function(e)
    {
      this._onTouchMoveDirectional("x", e);
      this._onTouchMoveDirectional("y", e);

      this.__momentum = true;
      // Stop bubbling and native event
      e.stop();
    },


    /**
     * Touch move handler for one direction.
     *
     * @param dir {String} Either 'x' or 'y'
     * @param e {qx.event.type.Touch} The touch event
     */
    _onTouchMoveDirectional : function(dir, e)
    {
      var docDir = (dir == "x" ? "Left" : "Top");

      // current scrollbar
      var scrollbar = this.getChildControl("scrollbar-" + dir, true);
      var show = this._isChildControlVisible("scrollbar-" + dir);

      if (show && scrollbar) {
        var delta = null;

        // get the delta for the current direction
        if(this.__old[dir] == 0) {
          delta = 0;
        } else {
          delta = -(e["getDocument" + docDir]() - this.__old[dir]);
        }

        // save the old value for the current direction
        this.__old[dir] = e["getDocument" + docDir]();

        scrollbar.scrollBy(delta);

        // if we have an old timeout for the current direction, clear it
        if (this.__impulseTimerId[dir]) {
          clearTimeout(this.__impulseTimerId[dir]);
          this.__impulseTimerId[dir] = null;
        }

        // set up a new timer for the current direction
        this.__impulseTimerId[dir] =
          setTimeout(qx.lang.Function.bind(function(delta) {
            this.__handleScrollImpulse(delta, dir);
          }, this, delta), 100);
      }
    },


    /**
     * Helper for momentum scrolling.
     *
     * @param delta {Number} The delta from the last scrolling.
     * @param dir {String} Direction of the scrollbar ('x' or 'y').
     */
    __handleScrollImpulse : function(delta, dir)
    {
      // delete the old timer id
      this.__impulseTimerId[dir] = null;

      // do nothing if the scrollbar is not visible or we don't need to scroll
      var show = this._isChildControlVisible("scrollbar-" + dir);
      if (delta == 0 || !show) {
        this.__momentum = false;
        return;
      }

      // linear momentum calculation
      if (delta > 0) {
        delta = Math.max(0, delta - 3);
      } else {
        delta = Math.min(0, delta + 3);
      }

      // set up a new timer with the new delta
      this.__impulseTimerId[dir] =
        setTimeout(qx.lang.Function.bind(function(delta, dir) {
          this.__handleScrollImpulse(delta, dir);
        }, this, delta, dir), 10);

      // scroll the desired new delta
      var scrollbar = this.getChildControl("scrollbar-" + dir, true);
      scrollbar.scrollBy(delta);
    }
  },


  destruct : function()
  {
    clearTimeout(this.__impulseTimerId.x);
    clearTimeout(this.__impulseTimerId.y);

    this.__impulseTimerId = this.__old = this.__momentum = null;
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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Shows a whole meta column. This includes a {@link Header},
 * a {@link Pane} and the needed scroll bars. This class handles the
 * virtual scrolling and does all the mouse event handling.
 *
 * @childControl header {qx.ui.table.pane.Header} header pane
 * @childControl pane {qx.ui.table.pane.Pane} table pane to show the data
 * @childControl focus-indicator {qx.ui.table.pane.FocusIndicator} shows the current focused cell
 * @childControl resize-line {qx.ui.core.Widget} resize line widget
 * @childControl scrollbar-x {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar}
 *               horizontal scrollbar widget (depends on the "qx.nativeScrollBars" setting which implementation is used)
 * @childControl scrollbar-y {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar}
 *               vertical scrollbar widget (depends on the "qx.nativeScrollBars" setting which implementation is used)
 */
qx.Class.define("qx.ui.table.pane.Scroller",
{
  extend : qx.ui.core.Widget,
  include : qx.core.Environment.filter({
      "true"        : qx.ui.core.scroll.MScrollBarFactory,
      "event.touch" : qx.ui.core.scroll.MTouchScroll
    }),



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param table {qx.ui.table.Table} the table the scroller belongs to.
   */
  construct : function(table)
  {
    this.base(arguments);

    this.__table = table;

    // init layout
    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(1, 1);
    this._setLayout(grid);

    // init child controls
    this.__header = this._showChildControl("header");
    this.__tablePane = this._showChildControl("pane");

    // the top line containing the header clipper and the top right widget
    this.__top = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
      minWidth: 0
    });
    this._add(this.__top, {row: 0, column: 0, colSpan: 2});

    // embed header into a scrollable container
    this.__headerClipper = new qx.ui.table.pane.Clipper();
    this.__headerClipper.add(this.__header);
    this.__headerClipper.addListener("losecapture", this._onChangeCaptureHeader, this);
    this.__headerClipper.addListener("mousemove", this._onMousemoveHeader, this);
    this.__headerClipper.addListener("mousedown", this._onMousedownHeader, this);
    this.__headerClipper.addListener("mouseup", this._onMouseupHeader, this);
    this.__headerClipper.addListener("click", this._onClickHeader, this);
    this.__top.add(this.__headerClipper, {flex: 1});

    // embed pane into a scrollable container
    this.__paneClipper = new qx.ui.table.pane.Clipper();
    this.__paneClipper.add(this.__tablePane);
    this.__paneClipper.addListener("mousewheel", this._onMousewheel, this);
    this.__paneClipper.addListener("mousemove", this._onMousemovePane, this);
    this.__paneClipper.addListener("mousedown", this._onMousedownPane, this);
    this.__paneClipper.addListener("mouseup", this._onMouseupPane, this);
    this.__paneClipper.addListener("click", this._onClickPane, this);
    this.__paneClipper.addListener("contextmenu", this._onContextMenu, this);
    this.__paneClipper.addListener("dblclick", this._onDblclickPane, this);
    this.__paneClipper.addListener("resize", this._onResizePane, this);

    // if we have overlayed scroll bars, we should use a separate container
    if (qx.core.Environment.get("os.scrollBarOverlayed")) {
      this.__clipperContainer = new qx.ui.container.Composite();
      this.__clipperContainer.setLayout(new qx.ui.layout.Canvas());
      this.__clipperContainer.add(this.__paneClipper, {edge: 0});
      this._add(this.__clipperContainer, {row: 1, column: 0});
    } else {
      this._add(this.__paneClipper, {row: 1, column: 0});
    }

    // init scroll bars
    this.__horScrollBar = this._showChildControl("scrollbar-x");
    this.__verScrollBar = this._showChildControl("scrollbar-y");

    // init focus indicator
    this.__focusIndicator = this.getChildControl("focus-indicator");
    // need to run the apply method at least once [BUG #4057]
    this.initShowCellFocusIndicator();

    // force creation of the resize line
    this.getChildControl("resize-line").hide();

    this.addListener("mouseout", this._onMouseout, this);
    this.addListener("appear", this._onAppear, this);
    this.addListener("disappear", this._onDisappear, this);

    this.__timer = new qx.event.Timer();
    this.__timer.addListener("interval", this._oninterval, this);
    this.initScrollTimeout();

  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} The minimum width a column could get in pixels. */
    MIN_COLUMN_WIDTH         : 10,

    /** {int} The radius of the resize region in pixels. */
    RESIZE_REGION_RADIUS     : 5,


    /**
     * (int) The number of pixels the mouse may move between mouse down and mouse up
     * in order to count as a click.
     */
    CLICK_TOLERANCE          : 5,


    /**
     * (int) The mask for the horizontal scroll bar.
     * May be combined with {@link #VERTICAL_SCROLLBAR}.
     *
     * @see #getNeededScrollBars
     */
    HORIZONTAL_SCROLLBAR     : 1,


    /**
     * (int) The mask for the vertical scroll bar.
     * May be combined with {@link #HORIZONTAL_SCROLLBAR}.
     *
     * @see #getNeededScrollBars
     */
    VERTICAL_SCROLLBAR       : 2
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  events :
  {
    /** Dispatched if the pane is scolled horizontally */
    "changeScrollY" : "qx.event.type.Data",

    /** Dispatched if the pane is scrolled vertically */
    "changeScrollX" : "qx.event.type.Data",

    /**See {@link qx.ui.table.Table#cellClick}.*/
    "cellClick" : "qx.ui.table.pane.CellEvent",

    /*** See {@link qx.ui.table.Table#cellDblclick}.*/
    "cellDblclick" : "qx.ui.table.pane.CellEvent",

    /**See {@link qx.ui.table.Table#cellContextmenu}.*/
    "cellContextmenu" : "qx.ui.table.pane.CellEvent",

    /** Dispatched when a sortable header was clicked */
    "beforeSort" : "qx.event.type.Data"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** Whether to show the horizontal scroll bar */
    horizontalScrollBarVisible :
    {
      check : "Boolean",
      init : false,
      apply : "_applyHorizontalScrollBarVisible",
      event : "changeHorizontalScrollBarVisible"
    },

    /** Whether to show the vertical scroll bar */
    verticalScrollBarVisible :
    {
      check : "Boolean",
      init : false,
      apply : "_applyVerticalScrollBarVisible",
      event : "changeVerticalScrollBarVisible"
    },

    /** The table pane model. */
    tablePaneModel :
    {
      check : "qx.ui.table.pane.Model",
      apply : "_applyTablePaneModel",
      event : "changeTablePaneModel"
    },


    /**
     * Whether column resize should be live. If false, during resize only a line is
     * shown and the real resize happens when the user releases the mouse button.
     */
    liveResize :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether the focus should moved when the mouse is moved over a cell. If false
     * the focus is only moved on mouse clicks.
     */
    focusCellOnMouseMove :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether to handle selections via the selection manager before setting the
     * focus.  The traditional behavior is to handle selections after setting the
     * focus, but setting the focus means redrawing portions of the table, and
     * some subclasses may want to modify the data to be displayed based on the
     * selection.
     */
    selectBeforeFocus :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether the cell focus indicator should be shown
     */
    showCellFocusIndicator :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowCellFocusIndicator"
    },


    /**
     * By default, the "cellContextmenu" event is fired only when a data cell
     * is right-clicked. It is not fired when a right-click occurs in the
     * empty area of the table below the last data row. By turning on this
     * property, "cellContextMenu" events will also be generated when a
     * right-click occurs in that empty area. In such a case, row identifier
     * in the event data will be null, so event handlers can check (row ===
     * null) to handle this case.
     */
    contextMenuFromDataCellsOnly :
    {
      check : "Boolean",
      init : true
    },


    /**
     * Whether to reset the selection when a header cell is clicked. Since
     * most data models do not have provisions to retain a selection after
     * sorting, the default is to reset the selection in this case. Some data
     * models, however, do have the capability to retain the selection, so
     * when using those, this property should be set to false.
     */
    resetSelectionOnHeaderClick :
    {
      check : "Boolean",
      init : true
    },


    /**
     * Interval time (in milliseconds) for the table update timer.
     * Setting this to 0 clears the timer.
     */
    scrollTimeout :
    {
      check : "Integer",
      init : 100,
      apply : "_applyScrollTimeout"
    },


    appearance :
    {
      refine : true,
      init : "table-scroller"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastRowCount : null,
    __table : null,

    __updateInterval : null,
    __updateContentPlanned : null,
    __onintervalWrapper : null,

    __moveColumn : null,
    __lastMoveColPos : null,
    __lastMoveTargetX : null,
    __lastMoveTargetScroller : null,
    __lastMoveMousePageX : null,

    __resizeColumn : null,
    __lastResizeMousePageX : null,
    __lastResizeWidth : null,

    __lastMouseDownCell : null,
    __firedClickEvent : false,
    __ignoreClick : null,
    __lastMousePageX : null,
    __lastMousePageY : null,

    __focusedCol : null,
    __focusedRow : null,

    __cellEditor : null,
    __cellEditorFactory : null,

    __topRightWidget : null,
    __horScrollBar : null,
    __verScrollBar : null,
    __header : null,
    __headerClipper : null,
    __tablePane : null,
    __paneClipper : null,
    __clipperContainer : null,
    __focusIndicator : null,
    __top : null,

    __timer : null,


    /**
     * The right inset of the pane. The right inset is the maximum of the
     * top right widget width and the scrollbar width (if visible).
     *
     * @return {Integer} The right inset of the pane
     */
    getPaneInsetRight : function()
    {
      var topRight = this.getTopRightWidget();
      var topRightWidth =
        topRight && topRight.isVisible() && topRight.getBounds() ?
          topRight.getBounds().width + topRight.getMarginLeft() + topRight.getMarginRight() :
          0;

      var scrollBar = this.__verScrollBar;
      var scrollBarWidth = this.getVerticalScrollBarVisible() ?
        this.getVerticalScrollBarWidth() + scrollBar.getMarginLeft() + scrollBar.getMarginRight() :
        0;

      return Math.max(topRightWidth, scrollBarWidth);
    },


    /**
     * Set the pane's width
     *
     * @param width {Integer} The pane's width
     */
    setPaneWidth : function(width)
    {
      if (this.isVerticalScrollBarVisible()) {
        width += this.getPaneInsetRight();
      }
      this.setWidth(width);
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "header":
          control = (this.getTable().getNewTablePaneHeader())(this);
          break;

        case "pane":
          control = (this.getTable().getNewTablePane())(this);
          break;

        case "focus-indicator":
          control = new qx.ui.table.pane.FocusIndicator(this);
          control.setUserBounds(0, 0, 0, 0);
          control.setZIndex(1000);
          control.addListener("mouseup", this._onMouseupFocusIndicator, this);
          this.__paneClipper.add(control);
          control.show();             // must be active for editor to operate
          control.setDecorator(null); // it can be initially invisible, though.
          break;

        case "resize-line":
          control = new qx.ui.core.Widget();
          control.setUserBounds(0, 0, 0, 0);
          control.setZIndex(1000);
          this.__paneClipper.add(control);
          break;

        case "scrollbar-x":
          control = this._createScrollBar("horizontal").set({
            alignY: "bottom"
          });
          control.addListener("scroll", this._onScrollX, this);

          if (this.__clipperContainer != null) {
            control.setMinHeight(qx.bom.element.Overflow.DEFAULT_SCROLLBAR_WIDTH);
            this.__clipperContainer.add(control, {bottom: 0, right: 0, left: 0});
          } else {
            this._add(control, {row: 2, column: 0});
          }
          break;

        case "scrollbar-y":
          control = this._createScrollBar("vertical");
          control.addListener("scroll", this._onScrollY, this);

          if (this.__clipperContainer != null) {
            this.__clipperContainer.add(control, {right: 0, bottom: 0, top: 0});
          } else {
            this._add(control, {row: 1, column: 1});
          }
          break;
      }

      return control || this.base(arguments, id);
    },


    // property modifier
    _applyHorizontalScrollBarVisible : function(value, old) {
      this.__horScrollBar.setVisibility(value ? "visible" : "excluded");
    },


    // property modifier
    _applyVerticalScrollBarVisible : function(value, old) {
      this.__verScrollBar.setVisibility(value ? "visible" : "excluded");
    },


    // property modifier
    _applyTablePaneModel : function(value, old)
    {
      if (old != null) {
        old.removeListener("modelChanged", this._onPaneModelChanged, this);
      }

      value.addListener("modelChanged", this._onPaneModelChanged, this);
    },


    // property modifier
    _applyShowCellFocusIndicator : function(value, old)
    {
      if(value) {
        this.__focusIndicator.setDecorator("table-scroller-focus-indicator");
        this._updateFocusIndicator();
      }
      else {
        if(this.__focusIndicator) {
          this.__focusIndicator.setDecorator(null);
        }
      }
    },


    /**
     * Get the current position of the vertical scroll bar.
     *
     * @return {Integer} The current scroll position.
     */
    getScrollY : function() {
      return this.__verScrollBar.getPosition();
    },


    /**
     * Set the current position of the vertical scroll bar.
     *
     * @param scrollY {Integer} The new scroll position.
     * @param renderSync {Boolean?false} Whether the table update should be
     *     performed synchonously.
     */
    setScrollY : function(scrollY, renderSync)
    {
      this.__verScrollBar.scrollTo(scrollY);
      if (renderSync) {
        this._updateContent();
      }
    },


    /**
     * Get the current position of the vertical scroll bar.
     *
     * @return {Integer} The current scroll position.
     */
    getScrollX : function() {
      return this.__horScrollBar.getPosition();
    },


    /**
     * Set the current position of the vertical scroll bar.
     *
     * @param scrollX {Integer} The new scroll position.
     */
    setScrollX : function(scrollX) {
      this.__horScrollBar.scrollTo(scrollX);
    },


    /**
     * Returns the table this scroller belongs to.
     *
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this.__table;
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     */
    onColVisibilityChanged : function()
    {
      this.updateHorScrollBarMaximum();
      this._updateFocusIndicator();
    },


    /**
     * Sets the column width.
     *
     * @param col {Integer} the column to change the width for.
     * @param width {Integer} the new width.
     * @return {void}
     */
    setColumnWidth : function(col, width)
    {
      this.__header.setColumnWidth(col, width);
      this.__tablePane.setColumnWidth(col, width);

      var paneModel = this.getTablePaneModel();
      var x = paneModel.getX(col);

      if (x != -1)
      {
        // The change was in this scroller
        this.updateHorScrollBarMaximum();
        this._updateFocusIndicator();
      }
    },


    /**
     * Event handler. Called when the column order has changed.
     *
     * @return {void}
     */
    onColOrderChanged : function()
    {
      this.__header.onColOrderChanged();
      this.__tablePane.onColOrderChanged();

      this.updateHorScrollBarMaximum();
    },


    /**
     * Event handler. Called when the table model has changed.
     *
     * @param firstRow {Integer} The index of the first row that has changed.
     * @param lastRow {Integer} The index of the last row that has changed.
     * @param firstColumn {Integer} The model index of the first column that has changed.
     * @param lastColumn {Integer} The model index of the last column that has changed.
     */
    onTableModelDataChanged : function(firstRow, lastRow, firstColumn, lastColumn)
    {
      this.__tablePane.onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn);
      var rowCount = this.getTable().getTableModel().getRowCount();

      if (rowCount != this.__lastRowCount)
      {
        this.updateVerScrollBarMaximum();

        if (this.getFocusedRow() >= rowCount)
        {
          if (rowCount == 0) {
            this.setFocusedCell(null, null);
          } else {
            this.setFocusedCell(this.getFocusedColumn(), rowCount - 1);
          }
        }
        this.__lastRowCount = rowCount;
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     */
    onSelectionChanged : function() {
      this.__tablePane.onSelectionChanged();
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     */
    onFocusChanged : function() {
      this.__tablePane.onFocusChanged();
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @return {void}
     */
    onTableModelMetaDataChanged : function()
    {
      this.__header.onTableModelMetaDataChanged();
      this.__tablePane.onTableModelMetaDataChanged();
    },


    /**
     * Event handler. Called when the pane model has changed.
     */
    _onPaneModelChanged : function()
    {
      this.__header.onPaneModelChanged();
      this.__tablePane.onPaneModelChanged();
    },


    /**
     * Event listener for the pane clipper's resize event
     */
    _onResizePane : function()
    {
      this.updateHorScrollBarMaximum();
      this.updateVerScrollBarMaximum();

      // The height has changed -> Update content
      this._updateContent();
      this.__header._updateContent();
      this.__table._updateScrollBarVisibility();
    },


    /**
     * Updates the maximum of the horizontal scroll bar, so it corresponds to the
     * total width of the columns in the table pane.
     */
    updateHorScrollBarMaximum : function()
    {
      var paneSize = this.__paneClipper.getInnerSize();
      if (!paneSize) {
        // will be called on the next resize event again
        return;
      }
      var scrollSize = this.getTablePaneModel().getTotalWidth();

      var scrollBar = this.__horScrollBar;

      if (paneSize.width < scrollSize)
      {
        var max = Math.max(0, scrollSize - paneSize.width);

        scrollBar.setMaximum(max);
        scrollBar.setKnobFactor(paneSize.width / scrollSize);

        var pos = scrollBar.getPosition();
        scrollBar.setPosition(Math.min(pos, max));
      }
      else
      {
        scrollBar.setMaximum(0);
        scrollBar.setKnobFactor(1);
        scrollBar.setPosition(0);
      }
    },


    /**
     * Updates the maximum of the vertical scroll bar, so it corresponds to the
     * number of rows in the table.
     */
    updateVerScrollBarMaximum : function()
    {
      var paneSize = this.__paneClipper.getInnerSize();
      if (!paneSize) {
        // will be called on the next resize event again
        return;
      }

      var tableModel = this.getTable().getTableModel();
      var rowCount = tableModel.getRowCount();

      if (this.getTable().getKeepFirstVisibleRowComplete()) {
        rowCount += 1;
      }

      var rowHeight = this.getTable().getRowHeight();
      var scrollSize = rowCount * rowHeight;
      var scrollBar = this.__verScrollBar;

      if (paneSize.height < scrollSize)
      {
        var max = Math.max(0, scrollSize - paneSize.height);

        scrollBar.setMaximum(max);
        scrollBar.setKnobFactor(paneSize.height / scrollSize);

        var pos = scrollBar.getPosition();
        scrollBar.setPosition(Math.min(pos, max));
      }
      else
      {
        scrollBar.setMaximum(0);
        scrollBar.setKnobFactor(1);
        scrollBar.setPosition(0);
      }
    },


    /**
     * Event handler. Called when the table property "keepFirstVisibleRowComplete"
     * changed.
     */
    onKeepFirstVisibleRowCompleteChanged : function()
    {
      this.updateVerScrollBarMaximum();
      this._updateContent();
    },


    /**
     * Event handler for the scroller's appear event
     */
    _onAppear : function() {
      // after the Scroller appears we start the interval again
      this._startInterval(this.getScrollTimeout());
    },


    /**
     * Event handler for the disappear event
     */
    _onDisappear : function()
    {
      // before the scroller disappears we need to stop it
      this._stopInterval();
    },


    /**
     * Event handler. Called when the horizontal scroll bar moved.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onScrollX : function(e)
    {
      var scrollLeft = e.getData();

      this.fireDataEvent("changeScrollX", scrollLeft, e.getOldData());
      this.__headerClipper.scrollToX(scrollLeft);
      this.__paneClipper.scrollToX(scrollLeft);
    },


    /**
     * Event handler. Called when the vertical scroll bar moved.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onScrollY : function(e)
    {
      this.fireDataEvent("changeScrollY", e.getData(), e.getOldData());
      this._postponedUpdateContent();
    },


    /**
     * Event handler. Called when the user moved the mouse wheel.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousewheel : function(e)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      // vertical scrolling
      var delta = e.getWheelDelta("y");
      // normalize that at least one step is scrolled at a time
      if (delta > 0 && delta < 1) {
        delta = 1;
      } else if (delta < 0 && delta > -1) {
        delta = -1;
      }
      this.__verScrollBar.scrollBySteps(delta);

      // horizontal scrolling
      delta = e.getWheelDelta("x");
      // normalize that at least one step is scrolled at a time
      if (delta > 0 && delta < 1) {
        delta = 1;
      } else if (delta < 0 && delta > -1) {
        delta = -1;
      }
      this.__horScrollBar.scrollBySteps(delta);

      // Update the focus
      if (this.__lastMousePageX && this.getFocusCellOnMouseMove()) {
        this._focusCellAtPagePos(this.__lastMousePageX, this.__lastMousePageY);
      }

      var position = this.__verScrollBar.getPosition();
      var max = this.__verScrollBar.getMaximum();
      // pass the event to the parent if the scrollbar is at an edge
      if (delta < 0 && position <= 0 || delta > 0 && position >= max) {
        return;
      }

      e.stop();
    },


    /**
     * Common column resize logic.
     *
     * @param pageX {Integer} the current mouse x position.
     * @return {void}
     */
    __handleResizeColumn : function(pageX)
    {
      var table = this.getTable();
      // We are currently resizing -> Update the position
      var headerCell = this.__header.getHeaderWidgetAtColumn(this.__resizeColumn);
      var minColumnWidth = headerCell.getSizeHint().minWidth;

      var newWidth = Math.max(minColumnWidth, this.__lastResizeWidth + pageX - this.__lastResizeMousePageX);

      if (this.getLiveResize()) {
        var columnModel = table.getTableColumnModel();
        columnModel.setColumnWidth(this.__resizeColumn, newWidth, true);
      } else {
        this.__header.setColumnWidth(this.__resizeColumn, newWidth, true);

        var paneModel = this.getTablePaneModel();
        this._showResizeLine(paneModel.getColumnLeft(this.__resizeColumn) + newWidth);
      }

      this.__lastResizeMousePageX += newWidth - this.__lastResizeWidth;
      this.__lastResizeWidth = newWidth;
    },


    /**
     * Common column move logic.
     *
     * @param pageX {Integer} the current mouse x position.
     * @return {void}
     *
     */
    __handleMoveColumn : function(pageX)
    {
      // We are moving a column

      // Check whether we moved outside the click tolerance so we can start
      // showing the column move feedback
      // (showing the column move feedback prevents the onclick event)
      var clickTolerance = qx.ui.table.pane.Scroller.CLICK_TOLERANCE;
      if (this.__header.isShowingColumnMoveFeedback()
        || pageX > this.__lastMoveMousePageX + clickTolerance
        || pageX < this.__lastMoveMousePageX - clickTolerance)
      {
        this.__lastMoveColPos += pageX - this.__lastMoveMousePageX;

        this.__header.showColumnMoveFeedback(this.__moveColumn, this.__lastMoveColPos);

        // Get the responsible scroller
        var targetScroller = this.__table.getTablePaneScrollerAtPageX(pageX);
        if (this.__lastMoveTargetScroller && this.__lastMoveTargetScroller != targetScroller) {
          this.__lastMoveTargetScroller.hideColumnMoveFeedback();
        }
        if (targetScroller != null) {
          this.__lastMoveTargetX = targetScroller.showColumnMoveFeedback(pageX);
        } else {
          this.__lastMoveTargetX = null;
        }

        this.__lastMoveTargetScroller = targetScroller;
        this.__lastMoveMousePageX = pageX;
      }
    },


    /**
     * Event handler. Called when the user moved the mouse over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousemoveHeader : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var useResizeCursor = false;
      var mouseOverColumn = null;

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this.__lastMousePageX = pageX;
      this.__lastMousePageY = pageY;

      if (this.__resizeColumn != null)
      {
        // We are currently resizing -> Update the position
        this.__handleResizeColumn(pageX);
        useResizeCursor = true;
        e.stopPropagation();
      }
      else if (this.__moveColumn != null)
      {
        // We are moving a column
        this.__handleMoveColumn(pageX);
        e.stopPropagation();
      }
      else
      {
        var resizeCol = this._getResizeColumnForPageX(pageX);
        if (resizeCol != -1)
        {
          // The mouse is over a resize region -> Show the right cursor
          useResizeCursor = true;
        }
        else
        {
          var tableModel = table.getTableModel();
          var col = this._getColumnForPageX(pageX);
          if (col != null && tableModel.isColumnSortable(col)) {
            mouseOverColumn = col;
          }
        }
      }

      var cursor = useResizeCursor ? "col-resize" : null;
      this.getApplicationRoot().setGlobalCursor(cursor);
      this.setCursor(cursor);
      this.__header.setMouseOverColumn(mouseOverColumn);
    },


    /**
     * Event handler. Called when the user moved the mouse over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousemovePane : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      //var useResizeCursor = false;

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this.__lastMousePageX = pageX;
      this.__lastMousePageY = pageY;

      var row = this._getRowForPagePos(pageX, pageY);
      if (row != null && this._getColumnForPageX(pageX) != null) {
        // The mouse is over the data -> update the focus
        if (this.getFocusCellOnMouseMove()) {
          this._focusCellAtPagePos(pageX, pageY);
        }
      }
      this.__header.setMouseOverColumn(null);
    },


    /**
     * Event handler. Called when the user pressed a mouse button over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousedownHeader : function(e)
    {
      if (! this.getTable().getEnabled()) {
        return;
      }

      var pageX = e.getDocumentLeft();

      // mouse is in header
      var resizeCol = this._getResizeColumnForPageX(pageX);
      if (resizeCol != -1)
      {
        // The mouse is over a resize region -> Start resizing
        this._startResizeHeader(resizeCol, pageX);
        e.stop();
      }
      else
      {
        // The mouse is not in a resize region
        var moveCol = this._getColumnForPageX(pageX);
        if (moveCol != null)
        {
          this._startMoveHeader(moveCol, pageX);
          e.stop();
        }
      }
    },


    /**
     * Start a resize session of the header.
     *
     * @param resizeCol {Integer} the column index
     * @param pageX {Integer} x coordinate of the mouse event
     * @return {void}
     */
    _startResizeHeader : function(resizeCol, pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();

      // The mouse is over a resize region -> Start resizing
      this.__resizeColumn = resizeCol;
      this.__lastResizeMousePageX = pageX;
      this.__lastResizeWidth = columnModel.getColumnWidth(this.__resizeColumn);
      this.__headerClipper.capture();
    },


    /**
     * Start a move session of the header.
     *
     * @param moveCol {Integer} the column index
     * @param pageX {Integer} x coordinate of the mouse event
     * @return {void}
     */
    _startMoveHeader : function(moveCol, pageX)
    {
      // Prepare column moving
      this.__moveColumn = moveCol;
      this.__lastMoveMousePageX = pageX;
      this.__lastMoveColPos = this.getTablePaneModel().getColumnLeft(moveCol);
      this.__headerClipper.capture();
    },



    /**
     * Event handler. Called when the user pressed a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousedownPane : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (table.isEditing()) {
        table.stopEditing();
      }

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row !== null)
      {
        // The focus indicator blocks the click event on the scroller so we
        // store the current cell and listen for the mouseup event on the
        // focus indicator
        //
        // INVARIANT:
        //  The members of this object always contain the last position of
        //  the cell on which the mousedown event occurred.
        //  *** These values are never cleared! ***.
        //  Different browsers/OS combinations issue events in different
        //  orders, and the context menu event, in particular, can be issued
        //  early or late (Firefox on Linux issues it early; Firefox on
        //  Windows issues it late) so no one may clear these values.
        //
        this.__lastMouseDownCell = {
          row : row,
          col : col
        };

        // On the other hand, we need to know if we've issued the click event
        // so we don't issue it twice, both from mouse-up on the focus
        // indicator, and from the click even on the pane. Both possibilities
        // are necessary, however, to maintain the qooxdoo order of events.
        this.__firedClickEvent = false;

        var selectBeforeFocus = this.getSelectBeforeFocus();

        if (selectBeforeFocus) {
          table.getSelectionManager().handleMouseDown(row, e);
        }

        // The mouse is over the data -> update the focus
        if (! this.getFocusCellOnMouseMove()) {
          this._focusCellAtPagePos(pageX, pageY);
        }

        if (! selectBeforeFocus) {
          table.getSelectionManager().handleMouseDown(row, e);
        }
      }
    },


    /**
     * Event handler for the focus indicator's mouseup event
     *
     * @param e {qx.event.type.Mouse} The mouse event
     */
    _onMouseupFocusIndicator : function(e)
    {
      if (this.__lastMouseDownCell &&
          !this.__firedClickEvent &&
          !this.isEditing() &&
          this.__focusIndicator.getRow() == this.__lastMouseDownCell.row &&
          this.__focusIndicator.getColumn() == this.__lastMouseDownCell.col)
      {
        this.fireEvent("cellClick",
                       qx.ui.table.pane.CellEvent,
                       [
                         this,
                         e,
                         this.__lastMouseDownCell.row,
                         this.__lastMouseDownCell.col
                       ],
                       true);
        this.__firedClickEvent = true;
      } else if (!this.isEditing()) {
        // if no cellClick event should be fired, act like a mousedown which
        // invokes the change of the selection e.g. [BUG #1632]
        this._onMousedownPane(e);
      }
    },


    /**
     * Event handler. Called when the event capturing of the header changed.
     * Stops/finishes an active header resize/move session if it lost capturing
     * during the session to stay in a stable state.
     *
     * @param e {qx.event.type.Data} The data event
     */
    _onChangeCaptureHeader : function(e)
    {
      if (this.__resizeColumn != null) {
        this._stopResizeHeader();
      }

      if (this.__moveColumn != null) {
        this._stopMoveHeader();
      }
    },


    /**
     * Stop a resize session of the header.
     *
     * @return {void}
     */
    _stopResizeHeader : function()
    {
      var columnModel = this.getTable().getTableColumnModel();

      // We are currently resizing -> Finish resizing
      if (! this.getLiveResize()) {
        this._hideResizeLine();
        columnModel.setColumnWidth(this.__resizeColumn,
                                   this.__lastResizeWidth,
                                   true);
      }

      this.__resizeColumn = null;
      this.__headerClipper.releaseCapture();

      this.getApplicationRoot().setGlobalCursor(null);
      this.setCursor(null);

      // handle edit cell if available
      if (this.isEditing()) {
        var height = this.__cellEditor.getBounds().height;
        this.__cellEditor.setUserBounds(0, 0, this.__lastResizeWidth, height);
      }
    },


    /**
     * Stop a move session of the header.
     *
     * @return {void}
     */
    _stopMoveHeader : function()
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();

      // We are moving a column -> Drop the column
      this.__header.hideColumnMoveFeedback();
      if (this.__lastMoveTargetScroller) {
        this.__lastMoveTargetScroller.hideColumnMoveFeedback();
      }

      if (this.__lastMoveTargetX != null)
      {
        var fromVisXPos = paneModel.getFirstColumnX() + paneModel.getX(this.__moveColumn);
        var toVisXPos = this.__lastMoveTargetX;
        if (toVisXPos != fromVisXPos && toVisXPos != fromVisXPos + 1)
        {
          // The column was really moved to another position
          // (and not moved before or after itself, which is a noop)

          // Translate visible positions to overall positions
          var fromCol = columnModel.getVisibleColumnAtX(fromVisXPos);
          var toCol   = columnModel.getVisibleColumnAtX(toVisXPos);
          var fromOverXPos = columnModel.getOverallX(fromCol);
          var toOverXPos = (toCol != null) ? columnModel.getOverallX(toCol) : columnModel.getOverallColumnCount();

          if (toOverXPos > fromOverXPos) {
            // Don't count the column itself
            toOverXPos--;
          }

          // Move the column
          columnModel.moveColumn(fromOverXPos, toOverXPos);

          // update the focus indicator including the editor
          this._updateFocusIndicator();
        }
      }

      this.__moveColumn = null;
      this.__lastMoveTargetX = null;
      this.__headerClipper.releaseCapture();
    },


    /**
     * Event handler. Called when the user released a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMouseupPane : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var row = this._getRowForPagePos(e.getDocumentLeft(), e.getDocumentTop());
      if (row != -1 && row != null && this._getColumnForPageX(e.getDocumentLeft()) != null) {
        table.getSelectionManager().handleMouseUp(row, e);
      }
    },


    /**
     * Event handler. Called when the user released a mouse button over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMouseupHeader : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (this.__resizeColumn != null)
      {
        this._stopResizeHeader();
        this.__ignoreClick = true;
        e.stop();
      }
      else if (this.__moveColumn != null)
      {
        this._stopMoveHeader();
        e.stop();
      }
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onClickHeader : function(e)
    {
      if (this.__ignoreClick)
      {
        this.__ignoreClick = false;
        return;
      }

      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var tableModel = table.getTableModel();

      var pageX = e.getDocumentLeft();

      var resizeCol = this._getResizeColumnForPageX(pageX);

      if (resizeCol == -1)
      {
        // mouse is not in a resize region
        var col = this._getColumnForPageX(pageX);

        if (col != null && tableModel.isColumnSortable(col))
        {
          // Sort that column
          var sortCol = tableModel.getSortColumnIndex();
          var ascending = (col != sortCol) ? true : !tableModel.isSortAscending();

          var data =
            {
              column     : col,
              ascending  : ascending,
              clickEvent : e
            };

          if (this.fireDataEvent("beforeSort", data, null, true))
          {
            // Stop cell editing
            if (table.isEditing()) {
              table.stopEditing();
            }

            tableModel.sortByColumn(col, ascending);
            if (this.getResetSelectionOnHeaderClick())
            {
              table.getSelectionModel().resetSelection();
            }
          }
        }
      }

      e.stop();
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onClickPane : function(e)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row != null && col != null)
      {
        table.getSelectionManager().handleClick(row, e);

        if (this.__focusIndicator.isHidden() ||
            (this.__lastMouseDownCell &&
             !this.__firedClickEvent &&
             !this.isEditing() &&
             row == this.__lastMouseDownCell.row &&
             col == this.__lastMouseDownCell.col))
        {
          this.fireEvent("cellClick",
                         qx.ui.table.pane.CellEvent,
                         [this, e, row, col],
                         true);
          this.__firedClickEvent = true;
        }
      }
    },


    /**
     * Event handler. Called when a context menu is invoked in a cell.
     *
     * @param e {qx.event.type.Mouse} the event.
     * @return {void}
     */
    _onContextMenu : function(e)
    {
      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      /*
       * The 'row' value will be null if the right-click was in the blank
       * area below the last data row. Some applications desire to receive
       * the context menu event anyway, and can set the property value of
       * contextMenuFromDataCellsOnly to false to achieve that.
       */
      if (row === null && this.getContextMenuFromDataCellsOnly())
      {
        return;
      }

      if (! this.getShowCellFocusIndicator() ||
          row === null ||
          (this.__lastMouseDownCell &&
           row == this.__lastMouseDownCell.row &&
           col == this.__lastMouseDownCell.col))
      {
        this.fireEvent("cellContextmenu",
                       qx.ui.table.pane.CellEvent,
                       [this, e, row, col],
                       true);

        // Now that the cellContextmenu handler has had a chance to build
        // the menu for this cell, display it (if there is one).
        var menu = this.getTable().getContextMenu();
        if (menu)
        {
          // A menu with no children means don't display any context menu
          // including the default context menu even if the default context
          // menu is allowed to be displayed normally. There's no need to
          // actually show an empty menu, though.
          if (menu.getChildren().length > 0) {
            menu.openAtMouse(e);
          }
          else
          {
            menu.exclude();
          }

          // Do not show native menu
          e.preventDefault();
        }
      }
    },


    // overridden
    _onContextMenuOpen : function(e)
    {
      // This is Widget's context menu handler which typically retrieves
      // and displays the menu as soon as it receives a "contextmenu" event.
      // We want to allow the cellContextmenu handler to create the menu,
      // so we'll override this method with a null one, and do the menu
      // placement and display handling in our _onContextMenu method.
    },


    /**
     * Event handler. Called when the user double clicked a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onDblclickPane : function(e)
    {
      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();


      this._focusCellAtPagePos(pageX, pageY);
      this.startEditing();

      var row = this._getRowForPagePos(pageX, pageY);
      if (row != -1 && row != null) {
        this.fireEvent("cellDblclick", qx.ui.table.pane.CellEvent, [this, e, row], true);
      }
    },


    /**
     * Event handler. Called when the mouse moved out.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMouseout : function(e)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      // Reset the resize cursor when the mouse leaves the header
      // If currently a column is resized then do nothing
      // (the cursor will be reset on mouseup)
      if (this.__resizeColumn == null)
      {
        this.setCursor(null);
        this.getApplicationRoot().setGlobalCursor(null);
      }

      this.__header.setMouseOverColumn(null);

      // in case the focus follows the mouse, it should be remove on mouseout
      if (this.getFocusCellOnMouseMove()) {
        this.__table.setFocusedCell();
      }
    },


    /**
     * Shows the resize line.
     *
     * @param x {Integer} the position where to show the line (in pixels, relative to
     *      the left side of the pane).
     * @return {void}
     */
    _showResizeLine : function(x)
    {
      var resizeLine = this._showChildControl("resize-line");

      var width = resizeLine.getWidth();
      var paneBounds = this.__paneClipper.getBounds();
      resizeLine.setUserBounds(
        x - Math.round(width/2), 0, width, paneBounds.height
      );
    },


    /**
     * Hides the resize line.
     */
    _hideResizeLine : function() {
      this._excludeChildControl("resize-line");
    },


    /**
     * Shows the feedback shown while a column is moved by the user.
     *
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the visible x position of the column in the whole table.
     */
    showColumnMoveFeedback : function(pageX)
    {
      var paneModel = this.getTablePaneModel();
      var columnModel = this.getTable().getTableColumnModel();
      var paneLeft = this.__tablePane.getContainerLocation().left;
      var colCount = paneModel.getColumnCount();

      var targetXPos = 0;
      var targetX = 0;
      var currX = paneLeft;

      for (var xPos=0; xPos<colCount; xPos++)
      {
        var col = paneModel.getColumnAtX(xPos);
        var colWidth = columnModel.getColumnWidth(col);

        if (pageX < currX + colWidth / 2) {
          break;
        }

        currX += colWidth;
        targetXPos = xPos + 1;
        targetX = currX - paneLeft;
      }

      // Ensure targetX is visible
      var scrollerLeft = this.__paneClipper.getContainerLocation().left;
      var scrollerWidth = this.__paneClipper.getBounds().width;
      var scrollX = scrollerLeft - paneLeft;

      // NOTE: +2/-1 because of feedback width
      targetX = qx.lang.Number.limit(targetX, scrollX + 2, scrollX + scrollerWidth - 1);

      this._showResizeLine(targetX);

      // Return the overall target x position
      return paneModel.getFirstColumnX() + targetXPos;
    },


    /**
     * Hides the feedback shown while a column is moved by the user.
     */
    hideColumnMoveFeedback : function() {
      this._hideResizeLine();
    },


    /**
     * Sets the focus to the cell that's located at the page position
     * <code>pageX</code>/<code>pageY</code>. If there is no cell at that position,
     * nothing happens.
     *
     * @param pageX {Integer} the x position in the page (in pixels).
     * @param pageY {Integer} the y position in the page (in pixels).
     * @return {void}
     */
    _focusCellAtPagePos : function(pageX, pageY)
    {
      var row = this._getRowForPagePos(pageX, pageY);

      if (row != -1 && row != null)
      {
        // The mouse is over the data -> update the focus
        var col = this._getColumnForPageX(pageX);
        this.__table.setFocusedCell(col, row);
      }
    },


    /**
     * Sets the currently focused cell.
     *
     * @param col {Integer} the model index of the focused cell's column.
     * @param row {Integer} the model index of the focused cell's row.
     * @return {void}
     */
    setFocusedCell : function(col, row)
    {
      if (!this.isEditing())
      {
        this.__tablePane.setFocusedCell(col, row, this.__updateContentPlanned);

        this.__focusedCol = col;
        this.__focusedRow = row;

        this._updateFocusIndicator();
      }
    },


    /**
     * Returns the column of currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedColumn : function() {
      return this.__focusedCol;
    },


    /**
     * Returns the row of currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedRow : function() {
      return this.__focusedRow;
    },


    /**
     * Scrolls a cell visible.
     *
     * @param col {Integer} the model index of the column the cell belongs to.
     * @param row {Integer} the model index of the row the cell belongs to.
     * @return {void}
     */
    scrollCellVisible : function(col, row)
    {
      var paneModel = this.getTablePaneModel();
      var xPos = paneModel.getX(col);

      if (xPos != -1)
      {
        var clipperSize = this.__paneClipper.getInnerSize();
        if (!clipperSize) {
          return;
        }

        var columnModel = this.getTable().getTableColumnModel();

        var colLeft = paneModel.getColumnLeft(col);
        var colWidth = columnModel.getColumnWidth(col);
        var rowHeight = this.getTable().getRowHeight();
        var rowTop = row * rowHeight;

        var scrollX = this.getScrollX();
        var scrollY = this.getScrollY();

        // NOTE: We don't use qx.lang.Number.limit, because min should win if max < min
        var minScrollX = Math.min(colLeft, colLeft + colWidth - clipperSize.width);
        var maxScrollX = colLeft;
        this.setScrollX(Math.max(minScrollX, Math.min(maxScrollX, scrollX)));

        var minScrollY = rowTop + rowHeight - clipperSize.height;

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          minScrollY += rowHeight;
        }

        var maxScrollY = rowTop;
        this.setScrollY(Math.max(minScrollY, Math.min(maxScrollY, scrollY)), true);
      }
    },


    /**
     * Returns whether currently a cell is editing.
     *
     * @return {var} whether currently a cell is editing.
     */
    isEditing : function() {
      return this.__cellEditor != null;
    },


    /**
     * Starts editing the currently focused cell. Does nothing if already
     * editing, if the column is not editable, or if the cell editor for the
     * column ascertains that the particular cell is not editable.
     *
     * @return {Boolean} whether editing was started
     */
    startEditing : function()
    {
      var table = this.getTable();
      var tableModel = table.getTableModel();
      var col = this.__focusedCol;

      if (
        !this.isEditing() &&
        (col != null) &&
        tableModel.isColumnEditable(col)
      ) {
        var row = this.__focusedRow;
        var xPos = this.getTablePaneModel().getX(col);
        var value = tableModel.getValue(col, row);

        // scroll cell into view
        this.scrollCellVisible(xPos, row);

        this.__cellEditorFactory = table.getTableColumnModel().getCellEditorFactory(col);

        var cellInfo =
        {
          col   : col,
          row   : row,
          xPos  : xPos,
          value : value,
          table : table
        };

        // Get a cell editor
        this.__cellEditor = this.__cellEditorFactory.createCellEditor(cellInfo);

        // We handle two types of cell editors: the traditional in-place
        // editor, where the cell editor returned by the factory must fit in
        // the space of the table cell; and a modal window in which the
        // editing takes place.  Additionally, if the cell editor determines
        // that it does not want to edit the particular cell being requested,
        // it may return null to indicate that that cell is not editable.
        if (this.__cellEditor === null)
        {
          // This cell is not editable even though its column is.
          return false;
        }
        else if (this.__cellEditor instanceof qx.ui.window.Window)
        {
          // It's a window.  Ensure that it's modal.
          this.__cellEditor.setModal(true);

          // At least for the time being, we disallow the close button.  It
          // acts differently than a cellEditor.close(), and invokes a bug
          // someplace.  Modal window cell editors should provide their own
          // buttons or means to activate a cellEditor.close() or equivalently
          // cellEditor.hide().
          this.__cellEditor.setShowClose(false);

          // Arrange to be notified when it is closed.
          this.__cellEditor.addListener(
            "close",
            this._onCellEditorModalWindowClose,
            this);

          // If there's a pre-open function defined for the table...
          var f = table.getModalCellEditorPreOpenFunction();
          if (f != null) {
            f(this.__cellEditor, cellInfo);
          }

          // Open it now.
          this.__cellEditor.open();
        }
        else
        {
          // The cell editor is a traditional in-place editor.
          var size = this.__focusIndicator.getInnerSize();
          this.__cellEditor.setUserBounds(0, 0, size.width, size.height);

          // prevent click event from bubbling up to the table
          this.__focusIndicator.addListener("mousedown", function(e)
          {
            this.__lastMouseDownCell = {
              row : this.__focusedRow,
              col : this.__focusedCol
            };
            e.stopPropagation();
          }, this);

          this.__focusIndicator.add(this.__cellEditor);
          this.__focusIndicator.addState("editing");
          this.__focusIndicator.setKeepActive(false);

          // Make the focus indicator visible during editing
          this.__focusIndicator.setDecorator("table-scroller-focus-indicator");

          this.__cellEditor.focus();
          this.__cellEditor.activate();
        }

        return true;
      }

      return false;
    },


    /**
     * Stops editing and writes the editor's value to the model.
     */
    stopEditing : function()
    {
      // If the focus indicator is not being shown normally...
      if (! this.getShowCellFocusIndicator())
      {
        // ... then hide it again
        this.__focusIndicator.setDecorator(null);
      }

      this.flushEditor();
      this.cancelEditing();
    },


    /**
     * Writes the editor's value to the model.
     */
    flushEditor : function()
    {
      if (this.isEditing())
      {
        var value = this.__cellEditorFactory.getCellEditorValue(this.__cellEditor);
        var oldValue = this.getTable().getTableModel().getValue(this.__focusedCol, this.__focusedRow);
        this.getTable().getTableModel().setValue(this.__focusedCol, this.__focusedRow, value);

        this.__table.focus();

        // Fire an event containing the value change.
        this.__table.fireDataEvent("dataEdited",
                                   {
                                     row      : this.__focusedRow,
                                     col      : this.__focusedCol,
                                     oldValue : oldValue,
                                     value    : value
                                   });
      }
    },


    /**
     * Stops editing without writing the editor's value to the model.
     */
    cancelEditing : function()
    {
      if (this.isEditing() && ! this.__cellEditor.pendingDispose)
      {
        if (this._cellEditorIsModalWindow)
        {
          this.__cellEditor.destroy();
          this.__cellEditor = null;
          this.__cellEditorFactory = null;
          this.__cellEditor.pendingDispose = true;
        }
        else
        {
          this.__focusIndicator.removeState("editing");
          this.__focusIndicator.setKeepActive(true);
          this.__cellEditor.destroy();
          this.__cellEditor = null;
          this.__cellEditorFactory = null;
        }
      }
    },


    /**
     * Event handler. Called when the modal window of the cell editor closes.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onCellEditorModalWindowClose : function(e) {
      this.stopEditing();
    },


    /**
     * Returns the model index of the column the mouse is over or null if the mouse
     * is not over a column.
     *
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the model index of the column the mouse is over.
     */
    _getColumnForPageX : function(pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = this.__tablePane.getContentLocation().left;

      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        var colWidth = columnModel.getColumnWidth(col);
        currX += colWidth;

        if (pageX < currX) {
          return col;
        }
      }

      return null;
    },


    /**
     * Returns the model index of the column that should be resized when dragging
     * starts here. Returns -1 if the mouse is in no resize region of any column.
     *
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the column index.
     */
    _getResizeColumnForPageX : function(pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = this.__header.getContainerLocation().left;
      var regionRadius = qx.ui.table.pane.Scroller.RESIZE_REGION_RADIUS;

      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        var colWidth = columnModel.getColumnWidth(col);
        currX += colWidth;

        if (pageX >= (currX - regionRadius) && pageX <= (currX + regionRadius)) {
          return col;
        }
      }

      return -1;
    },


    /**
     * Returns the model index of the row the mouse is currently over. Returns -1 if
     * the mouse is over the header. Returns null if the mouse is not over any
     * column.
     *
     * @param pageX {Integer} the mouse x position in the page.
     * @param pageY {Integer} the mouse y position in the page.
     * @return {Integer} the model index of the row the mouse is currently over.
     */
    _getRowForPagePos : function(pageX, pageY)
    {
      var panePos = this.__tablePane.getContentLocation();

      if (pageX < panePos.left || pageX > panePos.right)
      {
        // There was no cell or header cell hit
        return null;
      }

      if (pageY >= panePos.top && pageY <= panePos.bottom)
      {
        // This event is in the pane -> Get the row
        var rowHeight = this.getTable().getRowHeight();

        var scrollY = this.__verScrollBar.getPosition();

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          scrollY = Math.floor(scrollY / rowHeight) * rowHeight;
        }

        var tableY = scrollY + pageY - panePos.top;
        var row = Math.floor(tableY / rowHeight);

        var tableModel = this.getTable().getTableModel();
        var rowCount = tableModel.getRowCount();

        return (row < rowCount) ? row : null;
      }

      var headerPos = this.__header.getContainerLocation();

      if (
        pageY >= headerPos.top &&
        pageY <= headerPos.bottom &&
        pageX <= headerPos.right)
      {
        // This event is in the pane -> Return -1 for the header
        return -1;
      }

      return null;
    },


    /**
     * Sets the widget that should be shown in the top right corner.
     *
     * The widget will not be disposed, when this table scroller is disposed. So the
     * caller has to dispose it.
     *
     * @param widget {qx.ui.core.Widget} The widget to set. May be null.
     * @return {void}
     */
    setTopRightWidget : function(widget)
    {
      var oldWidget = this.__topRightWidget;

      if (oldWidget != null) {
        this.__top.remove(oldWidget);
      }

      if (widget != null) {
        this.__top.add(widget);
      }

      this.__topRightWidget = widget;
    },


    /**
     * Get the top right widget
     *
     * @return {qx.ui.core.Widget} The top right widget.
     */
    getTopRightWidget : function() {
      return this.__topRightWidget;
    },


    /**
     * Returns the header.
     *
     * @return {qx.ui.table.pane.Header} the header.
     */
    getHeader : function() {
      return this.__header;
    },


    /**
     * Returns the table pane.
     *
     * @return {qx.ui.table.pane.Pane} the table pane.
     */
    getTablePane : function() {
      return this.__tablePane;
    },


    /**
     * Get the rendered width of the vertical scroll bar. The return value is
     * <code>0</code> if the scroll bar is invisible or not yet rendered.
     *
     * @internal
     * @return {Integer} The width of the vertical scroll bar
     */
    getVerticalScrollBarWidth : function()
    {
      var scrollBar = this.__verScrollBar;
      return scrollBar.isVisible() ? (scrollBar.getSizeHint().width || 0) : 0;
    },


    /**
     * Returns which scrollbars are needed.
     *
     * @param forceHorizontal {Boolean ? false} Whether to show the horizontal
     *      scrollbar always.
     * @param preventVertical {Boolean ? false} Whether to show the vertical scrollbar
     *      never.
     * @return {Integer} which scrollbars are needed. This may be any combination of
     *      {@link #HORIZONTAL_SCROLLBAR} or {@link #VERTICAL_SCROLLBAR}
     *      (combined by OR).
     */
    getNeededScrollBars : function(forceHorizontal, preventVertical)
    {
      var verScrollBar = this.__verScrollBar;
      var verBarWidth = verScrollBar.getSizeHint().width
        + verScrollBar.getMarginLeft() + verScrollBar.getMarginRight();

      var horScrollBar = this.__horScrollBar;
      var horBarHeight = horScrollBar.getSizeHint().height
        + horScrollBar.getMarginTop() + horScrollBar.getMarginBottom();

      // Get the width and height of the view (without scroll bars)
      var clipperSize = this.__paneClipper.getInnerSize();
      var viewWidth = clipperSize ? clipperSize.width : 0;

      if (this.getVerticalScrollBarVisible()) {
        viewWidth += verBarWidth;
      }

      var viewHeight = clipperSize ? clipperSize.height : 0;

      if (this.getHorizontalScrollBarVisible()) {
        viewHeight += horBarHeight;
      }

      var tableModel = this.getTable().getTableModel();
      var rowCount = tableModel.getRowCount();

      // Get the (virtual) width and height of the pane
      var paneWidth = this.getTablePaneModel().getTotalWidth();
      var paneHeight = this.getTable().getRowHeight() * rowCount;

      // Check which scrollbars are needed
      var horNeeded = false;
      var verNeeded = false;

      if (paneWidth > viewWidth) {
        horNeeded = true;

        if (paneHeight > viewHeight - horBarHeight) {
          verNeeded = true;
        }
      } else if (paneHeight > viewHeight) {
        verNeeded = true;

        if (!preventVertical && (paneWidth > viewWidth - verBarWidth)) {
          horNeeded = true;
        }
      }

      // Create the mask
      var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
      var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;
      return ((forceHorizontal || horNeeded) ? horBar : 0) | ((preventVertical || !verNeeded) ? 0 : verBar);
    },


    /**
     * Return the pane clipper. It is sometimes required for special activities
     * such as tracking events for drag&drop.
     *
     * @return {qx.ui.table.pane.Clipper}
     *   The pane clipper for this scroller.
     */
    getPaneClipper : function()
    {
      return this.__paneClipper;
    },

    // property apply method
    _applyScrollTimeout : function(value, old) {
      this._startInterval(value);
    },


    /**
     * Starts the current running interval
     *
     * @param timeout {Integer} The timeout between two table updates
     */
    _startInterval : function (timeout)
    {
      this.__timer.setInterval(timeout);
      this.__timer.start();
    },


    /**
     * stops the current running interval
     */
    _stopInterval : function ()
    {
      this.__timer.stop();
    },


    /**
     * Does a postponed update of the content.
     *
     * @see #_updateContent
     */
    _postponedUpdateContent : function()
    {
      //this.__updateContentPlanned = true;
      this._updateContent();
    },


    /**
     * Timer event handler. Periodically checks whether a table update is
     * required. The update interval is controlled by the {@link #scrollTimeout}
     * property.
     *
     * @signature function()
     */
    _oninterval : qx.event.GlobalError.observeMethod(function()
    {
      if (this.__updateContentPlanned && !this.__tablePane._layoutPending)
      {
        this.__updateContentPlanned = false;
        this._updateContent();
      }
    }),


    /**
     * Updates the content. Sets the right section the table pane should show and
     * does the scrolling.
     */
    _updateContent : function()
    {
      var paneSize = this.__paneClipper.getInnerSize();
      if (!paneSize) {
        return;
      }
      var paneHeight = paneSize.height;

      var scrollX = this.__horScrollBar.getPosition();
      var scrollY = this.__verScrollBar.getPosition();
      var rowHeight = this.getTable().getRowHeight();

      var firstRow = Math.floor(scrollY / rowHeight);
      var oldFirstRow = this.__tablePane.getFirstVisibleRow();
      this.__tablePane.setFirstVisibleRow(firstRow);

      var visibleRowCount = Math.ceil(paneHeight / rowHeight);
      var paneOffset = 0;
      var firstVisibleRowComplete = this.getTable().getKeepFirstVisibleRowComplete();

      if (!firstVisibleRowComplete)
      {

        // NOTE: We don't consider paneOffset, because this may cause alternating
        //       adding and deleting of one row when scrolling. Instead we add one row
        //       in every case.
        visibleRowCount++;

        paneOffset = scrollY % rowHeight;
      }

      this.__tablePane.setVisibleRowCount(visibleRowCount);

      if (firstRow != oldFirstRow) {
        this._updateFocusIndicator();
      }

      this.__paneClipper.scrollToX(scrollX);

      // Avoid expensive calls to setScrollTop if
      // scrolling is not needed
      if (! firstVisibleRowComplete ) {
        this.__paneClipper.scrollToY(paneOffset);
      }
    },

    /**
     * Updates the location and the visibility of the focus indicator.
     *
     * @return {void}
     */
    _updateFocusIndicator : function()
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      this.__focusIndicator.moveToCell(this.__focusedCol, this.__focusedRow);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopInterval();

    // this object was created by the table on init so we have to clean it up.
    var tablePaneModel = this.getTablePaneModel();
    if (tablePaneModel)
    {
      tablePaneModel.dispose();
    }

    this.__lastMouseDownCell = this.__topRightWidget = this.__table = null;
    this._disposeObjects("__horScrollBar", "__verScrollBar",
                         "__headerClipper", "__paneClipper", "__focusIndicator",
                         "__header", "__tablePane", "__top", "__timer",
                         "__clipperContainer");
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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Clipping area for the table header and table pane.
 */
qx.Class.define("qx.ui.table.pane.Clipper",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments, new qx.ui.layout.Grow());
    this.setMinWidth(0);
  },

  members :
  {
    /**
     * Scrolls the element's content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     * @return {void}
     */
    scrollToX : function(value) {
      this.getContentElement().scrollToX(value, false);
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollToY : function(value) {
      this.getContentElement().scrollToY(value, true);
    }
  }
});/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The focus indicator widget
 */
qx.Class.define("qx.ui.table.pane.FocusIndicator",
{
  extend : qx.ui.container.Composite,

  /**
   * @param scroller {Scroller} The scroller, which contains this focus indicator
   */
  construct : function(scroller)
  {
    this.base(arguments);
    this.__scroller = scroller;

    this.setKeepActive(true);
    this.addListener("keypress", this._onKeyPress, this);
  },

  properties :
  {
    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    /** Table row, where the indicator is placed. */
    row : {
      check : "Integer",
      nullable : true
    },

    /** Table column, where the indicator is placed. */
    column : {
      check : "Integer",
      nullable : true
    }
  },

  members :
  {
    __scroller : null,


    /**
     * Keypress handler. Suppress all key events but "Enter" and "Escape"
     *
     * @param e {qx.event.type.KeySequence} key event
     */
    _onKeyPress : function(e)
    {
      var iden = e.getKeyIdentifier();
      if (iden !== "Escape" && iden !== "Enter") {
        e.stopPropagation();
      }
    },


    /**
     * Move the focus indicator to the given table cell.
     *
     * @param col {Integer?null} The table column
     * @param row {Integer?null} The table row
     */
    moveToCell : function(col, row)
    {
      // check if the focus indicator is shown and if the new column is
      // editable. if not, just exclude the incdicator because the mouse events
      // should go to the cell itself linke with HTML links [BUG #4250]
      if (
        !this.__scroller.getShowCellFocusIndicator() &&
        !this.__scroller.getTable().getTableModel().isColumnEditable(col)
      ) {
        this.exclude();
        return;
      } else {
        this.show();
      }

      if (col == null)
      {
        this.hide();
        this.setRow(null);
        this.setColumn(null);
      }
      else
      {
        var xPos = this.__scroller.getTablePaneModel().getX(col);

        if (xPos == -1)
        {
          this.hide();
          this.setRow(null);
          this.setColumn(null);
        }
        else
        {
          var table = this.__scroller.getTable();
          var columnModel = table.getTableColumnModel();
          var paneModel = this.__scroller.getTablePaneModel();

          var firstRow = this.__scroller.getTablePane().getFirstVisibleRow();
          var rowHeight = table.getRowHeight();

          this.setUserBounds(
              paneModel.getColumnLeft(col) - 2,
              (row - firstRow) * rowHeight - 2,
              columnModel.getColumnWidth(col) + 3,
              rowHeight + 3
          );
          this.show();

          this.setRow(row);
          this.setColumn(col);
        }
      }
    }
  },

  destruct : function () {
     this.__scroller = null;
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
     * David Perez Carmona (david-perez)

************************************************************************ */

/**
 * A cell event instance contains all data for mouse events related to cells in
 * a table.
 **/
qx.Class.define("qx.ui.table.pane.CellEvent",
{
  extend : qx.event.type.Mouse,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The table row of the event target */
    row :
    {
      check : "Integer",
      nullable: true
    },

    /** The table column of the event target */
    column :
    {
      check : "Integer",
      nullable: true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */

     /**
      * Initialize the event
      *
      * @param scroller {qx.ui.table.pane.Scroller} The tables pane scroller
      * @param me {qx.event.type.Mouse} The original mouse event
      * @param row {Integer?null} The cell's row index
      * @param column {Integer?null} The cell's column index
      */
    init : function(scroller, me, row, column)
    {
      me.clone(this);
      this.setBubbles(false);

      if (row != null) {
        this.setRow(row);
      } else {
        this.setRow(scroller._getRowForPagePos(this.getDocumentLeft(), this.getDocumentTop()));
      }

      if (column != null) {
        this.setColumn(column);
      } else {
        this.setColumn(scroller._getColumnForPageX(this.getDocumentLeft()));
      }
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone.set({
        row: this.getRow(),
        column: this.getColumn()
      });

      return clone;
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
 * Helper functions for numbers.
 *
 * The native JavaScript Number is not modified by this class.
 *
 */
qx.Class.define("qx.lang.Number",
{
  statics :
  {
    /**
     * Check whether the number is in a given range
     *
     * @param nr {Number} the number to check
     * @param vmin {Integer} lower bound of the range
     * @param vmax {Integer} upper bound of the range
     * @return {Boolean} whether the number is >= vmin and <= vmax
     */
    isInRange : function(nr, vmin, vmax) {
      return nr >= vmin && nr <= vmax;
    },


    /**
     * Check whether the number is between a given range
     *
     * @param nr {Number} the number to check
     * @param vmin {Integer} lower bound of the range
     * @param vmax {Integer} upper bound of the range
     * @return {Boolean} whether the number is > vmin and < vmax
     */
    isBetweenRange : function(nr, vmin, vmax) {
      return nr > vmin && nr < vmax;
    },


    /**
     * Limit the number to a given range
     *
     * * If the number is greater than the upper bound, the upper bound is returned
     * * If the number is smaller than the lower bound, the lower bound is returned
     * * If the number is in the range, the number is returned
     *
     * @param nr {Number} the number to limit
     * @param vmin {Integer} lower bound of the range
     * @param vmax {Integer} upper bound of the range
     * @return {Integer} the limited number
     */
    limit : function(nr, vmin, vmax)
    {
      if (vmax != null && nr > vmax) {
        return vmax;
      } else if (vmin != null && nr < vmin) {
        return vmin;
      } else {
        return nr;
      }
    }
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

************************************************************************ */

/**
 * The model of a table pane. This model works as proxy to a
 * {@link qx.ui.table.columnmodel.Basic} and manages the visual order of the columns shown in
 * a {@link Pane}.
 */
qx.Class.define("qx.ui.table.pane.Model",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   *
   * @param tableColumnModel {qx.ui.table.columnmodel.Basic} The TableColumnModel of which this
   *    model is the proxy.
   */
  construct : function(tableColumnModel)
  {
    this.base(arguments);

    this.setTableColumnModel(tableColumnModel);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the model changed. */
    "modelChanged" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {string} The type of the event fired when the model changed. */
    EVENT_TYPE_MODEL_CHANGED : "modelChanged"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** The visible x position of the first column this model should contain. */
    firstColumnX :
    {
      check : "Integer",
      init : 0,
      apply : "_applyFirstColumnX"
    },


    /**
     * The maximum number of columns this model should contain. If -1 this model will
     * contain all remaining columns.
     */
    maxColumnCount :
    {
      check : "Number",
      init : -1,
      apply : "_applyMaxColumnCount"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __columnCount : null,
    __tableColumnModel : null,


    // property modifier
    _applyFirstColumnX : function(value, old)
    {
      this.__columnCount = null;
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },

    // property modifier
    _applyMaxColumnCount : function(value, old)
    {
      this.__columnCount = null;
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },


    /**
     * Connects the table model to the column model
     *
     * @param tableColumnModel {qx.ui.table.columnmodel.Basic} the column model
     */
    setTableColumnModel : function(tableColumnModel)
    {
      if (this.__tableColumnModel) {
        this.__tableColumnModel.removeListener("visibilityChangedPre", this._onColVisibilityChanged, this);
        this.__tableColumnModel.removeListener("headerCellRendererChanged", this._onColVisibilityChanged, this);
      }
      this.__tableColumnModel = tableColumnModel;
      this.__tableColumnModel.addListener("visibilityChangedPre", this._onColVisibilityChanged, this);
      this.__tableColumnModel.addListener("headerCellRendererChanged", this._onHeaderCellRendererChanged, this);
      this.__columnCount = null;
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColVisibilityChanged : function(evt)
    {
      this.__columnCount = null;

      // TODO: Check whether the column is in this model (This is a little bit
      //     tricky, because the column could _have been_ in this model, but is
      //     not in it after the change)
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },


    /**
     * Event handler. Called when the cell renderer of a column has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onHeaderCellRendererChanged : function(evt)
    {
      this.fireEvent(qx.ui.table.pane.Model.EVENT_TYPE_MODEL_CHANGED);
    },


    /**
     * Returns the number of columns in this model.
     *
     * @return {Integer} the number of columns in this model.
     */
    getColumnCount : function()
    {
      if (this.__columnCount == null)
      {
        var firstX = this.getFirstColumnX();
        var maxColCount = this.getMaxColumnCount();
        var totalColCount = this.__tableColumnModel.getVisibleColumnCount();

        if (maxColCount == -1 || (firstX + maxColCount) > totalColCount) {
          this.__columnCount = totalColCount - firstX;
        } else {
          this.__columnCount = maxColCount;
        }
      }

      return this.__columnCount;
    },


    /**
     * Returns the model index of the column at the position <code>xPos</code>.
     *
     * @param xPos {Integer} the x position in the table pane of the column.
     * @return {Integer} the model index of the column.
     */
    getColumnAtX : function(xPos)
    {
      var firstX = this.getFirstColumnX();
      return this.__tableColumnModel.getVisibleColumnAtX(firstX + xPos);
    },


    /**
     * Returns the x position of the column <code>col</code>.
     *
     * @param col {Integer} the model index of the column.
     * @return {Integer} the x position in the table pane of the column.
     */
    getX : function(col)
    {
      var firstX = this.getFirstColumnX();
      var maxColCount = this.getMaxColumnCount();

      var x = this.__tableColumnModel.getVisibleX(col) - firstX;

      if (x >= 0 && (maxColCount == -1 || x < maxColCount)) {
        return x;
      } else {
        return -1;
      }
    },


    /**
     * Gets the position of the left side of a column (in pixels, relative to the
     * left side of the table pane).
     *
     * This value corresponds to the sum of the widths of all columns left of the
     * column.
     *
     * @param col {Integer} the model index of the column.
     * @return {var} the position of the left side of the column.
     */
    getColumnLeft : function(col)
    {
      var left = 0;
      var colCount = this.getColumnCount();

      for (var x=0; x<colCount; x++)
      {
        var currCol = this.getColumnAtX(x);

        if (currCol == col) {
          return left;
        }

        left += this.__tableColumnModel.getColumnWidth(currCol);
      }

      return -1;
    },


    /**
     * Returns the total width of all columns in the model.
     *
     * @return {Integer} the total width of all columns in the model.
     */
    getTotalWidth : function()
    {
      var totalWidth = 0;
      var colCount = this.getColumnCount();

      for (var x=0; x<colCount; x++)
      {
        var col = this.getColumnAtX(x);
        totalWidth += this.__tableColumnModel.getColumnWidth(col);
      }

      return totalWidth;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    if (this.__tableColumnModel)
    {
      this.__tableColumnModel.removeListener("visibilityChangedPre", this._onColVisibilityChanged, this);
      this.__tableColumnModel.removeListener("headerCellRendererChanged", this._onColVisibilityChanged, this);
    }
    this.__tableColumnModel = null;
  }
});
