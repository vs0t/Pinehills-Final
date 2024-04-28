var InventoryEditBox = React.createClass({
  getInitialState: function () {
    return {
      inventoryItemsEA: [],
      selectedInventoryIdEA: null,
      selectedInventoryDetailsEA: null,
      dataEA: [],
      viewthepageEA: 0,
      productDataEA: [],
    };
  },
  loadAllowLogin: function () {
    $.ajax({
      url: "/getloggedin",
      dataType: "json",
      cache: false,
      success: function (datalog) {
        this.setState({ dataEA: datalog });
        this.setState({ viewthepageEA: this.state.dataEA[0].CatagoryID });
        console.log("Logged in:" + this.state.viewthepageEA);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  },
  componentDidMount: function () {
    this.loadAllowLogin();
    this.fetchInventoryItems();
    this.loadProductsFromServer();
  },
  fetchInventoryItems: function (productId) {
    fetch("/searchinventory" + (productId ? `?productId=${productId}` : ""))
      .then((response) => response.json())
      .then((data) => this.setState({ inventoryItemsEA: data }))
      .catch((error) => console.error("Error fetching inventory:", error));
  },
  loadProductsFromServer: function () {
    fetch("/searchproducts")
      .then((response) => response.json())
      .then((productData) => {
        this.setState({ productDataEA: productData });
      })
      .catch((error) => {
        console.error("/searchproducts", error.toString());
      });
  },
  selectInventoryItem: function (inventoryId, inventoryDetails) {
    this.setState({
      selectedInventoryIdEA: inventoryId,
      selectedInventoryDetailsEA: inventoryDetails,
    });
  },
  deleteInventoryItem: function (inventoryId) {
    fetch(`/deleteinventoryitem/${inventoryId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Inventory item deleted successfully!");
        this.fetchInventoryItems();
      })
      .catch((error) => console.error("Error deleting inventory item:", error));
  },
  render: function () {
    if (this.state.viewthepageEA == 0 || this.state.viewthepageEA !== 2) {
      return (
        <div id="error">
          You do not have access to this page, contact the Systems Admin if you
          need access but don't have it.
        </div>
      );
    } else {
      return (
        <div>
          {/* <h1>Inventory Edit</h1> */}
          <InventorySearchForm
            onInventorySearch={this.fetchInventoryItems}
            productData={this.state.productDataEA}
          />
          <InventoryList
            inventoryItems={this.state.inventoryItemsEA}
            onSelectInventoryItem={this.selectInventoryItem}
            onDeleteInventoryItem={this.deleteInventoryItem}
          />
          {this.state.selectedInventoryIdEA && (
            <InventoryEditForm
              inventoryId={this.state.selectedInventoryIdEA}
              inventoryDetails={this.state.selectedInventoryDetailsEA}
              refreshInventoryItems={this.fetchInventoryItems}
            />
          )}
        </div>
      );
    }
  },
});

var InventoryList = React.createClass({
  render: function () {
    var inventoryNodes = this.props.inventoryItems.map((item) => (
      <InventoryItem
        key={item.InventoryID}
        item={item}
        onSelectInventoryItem={this.props.onSelectInventoryItem}
        onDeleteInventoryItem={this.props.onDeleteInventoryItem}
      />
    ));
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Inventory ID</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>{inventoryNodes}</tbody>
        </table>
      </div>
    );
  },
});

var InventoryItem = React.createClass({
  handleClick: function () {
    this.props.onSelectInventoryItem(
      this.props.item.InventoryID,
      this.props.item
    );
  },
  handleDeleteClick: function () {
    this.props.onDeleteInventoryItem(this.props.item.InventoryID);
  },
  render: function () {
    const { InventoryID, ProductName, InventoryQuantity } = this.props.item;
    return (
      <tr>
        <td>{InventoryID}</td>
        <td>{ProductName}</td>
        <td>{InventoryQuantity}</td>
        <td>
          <button onClick={this.handleClick}>Edit</button>
        </td>
        <td>
          <button onClick={this.handleDeleteClick}>Delete</button>
        </td>
      </tr>
    );
  },
});

var InventoryEditForm = React.createClass({
  getInitialState: function () {
    const { ProductID, InventoryQuantity } = this.props.inventoryDetails;
    return {
      selectedProductIdEA: ProductID || "",
      quantityEA: InventoryQuantity || "",
      productDataEA: [],
    };
  },
  componentDidMount: function () {
    this.loadProductOptions();
  },
  loadProductOptions: function () {
    fetch("/searchproducts")
      .then((response) => response.json())
      .then((data) => this.setState({ productDataEA: data }))
      .catch((error) => console.error("/searchproducts", error.toString()));
  },
  componentDidUpdate: function (prevProps) {
    if (this.props.inventoryId !== prevProps.inventoryId) {
      const { ProductID, InventoryQuantity } = this.props.inventoryDetails;
      this.setState({
        selectedProductIdEA: ProductID || "",
        quantityEA: InventoryQuantity || "",
      });
    }
  },
  handleSubmit: function (event) {
    event.preventDefault();
    const inventoryData = {
      inventoryId: this.props.inventoryId,
      productID: this.state.selectedProductIdEA,
      quantity: this.state.quantityEA,
    };

    fetch("/updateinventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Inventory updated successfully!");
        this.props.refreshInventoryItems();
      })
      .catch((error) => console.error("Error updating inventory:", error));
  },
  handleProductChange: function (event) {
    this.setState({ selectedProductIdEA: event.target.value });
  },
  handleQuantityChange: function (event) {
    this.setState({ quantityEA: event.target.value });
  },
  render: function () {
    return (
      <div>
        <h2>Edit Inventory ID: {this.props.inventoryId}</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Product Name:
            <SelectList
              data={this.state.productDataEA}
              onChange={this.handleProductChange}
              value={this.state.selectedProductIdEA}
            />
          </label>
          <br />
          <label>
            Quantity:
            <TextInput
              inputType="number"
              uniqueName="quantityEA"
              value={this.state.quantityEA}
              required={true}
              minCharacters={1}
              validate={(value) => /^\d+$/.test(value)}
              onChange={this.handleQuantityChange}
              errorMessage="Quantity is invalid"
              emptyMessage="Quantity is required"
            />
          </label>
          <br />
          <button type="submit">Submit Inventory Update</button>
        </form>
      </div>
    );
  },
});

var SelectList = React.createClass({
  handleChange: function (event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },
  render: function () {
    var options = this.props.data.map(function (product) {
      return (
        <option key={product.ProductID} value={product.ProductID}>
          {product.ProductName}
        </option>
      );
    });
    return (
      <select
        name="productIDEA"
        id="productIDEA"
        onChange={this.handleChange}
        value={this.props.value}
      >
        <option value="">Select a Product</option>
        {options}
      </select>
    );
  },
});

var TextInput = React.createClass({
  handleChange: function (event) {
    this.props.onChange(event);
  },
  render: function () {
    return (
      <div>
        <input
          type={this.props.inputType || "text"}
          name={this.props.uniqueName}
          value={this.props.value}
          onChange={this.handleChange}
          required={this.props.required}
        />
        {this.props.errorVisible && <div>{this.props.errorMessage}</div>}
      </div>
    );
  },
});

var InventorySearchForm = React.createClass({
  getInitialState: function () {
    return {
      selectedProductIdEA: "",
    };
  },
  handleSubmit: function (e) {
    e.preventDefault();
    this.props.onInventorySearch(this.state.selectedProductIdEA);
  },
  handleChange: function (event) {
    this.setState({ selectedProductIdEA: event.target.value });
  },
  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>Inventory Search for Editing</h2>
        <SelectList
          data={this.props.productData}
          onChange={this.handleChange}
          value={this.state.selectedProductIdEA}
        />
        <input type="submit" value="Search Inventory" />
      </form>
    );
  },
});

ReactDOM.render(<InventoryEditBox />, document.getElementById("content"));