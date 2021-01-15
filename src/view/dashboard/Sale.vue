// Sales Management
<template>
  <v-card class="sale height-100pc">
    <crud-table
      namespace="/rest/sales"
      :exclude-actions="['edit']"
      :show-expand="true"
      @action="actionEvent"
      ref="$crud$"
    >
      <template v-slot:add-dialog>
        <simple-form-navigation
          v-model="addDialog"
          width="1000"
          :successAction="saveEntity"
          @callback="reload"
        >
          <v-card elevation="0">
            <v-card-subtitle>Sales order information</v-card-subtitle>
            <v-card-text>
              <v-row class="my-n6">
                <v-col md="6">
                  <v-text-field
                    label="Sales order number"
                    clearable
                    v-model="saleModel.saleNo"
                  />
                </v-col>
                <v-col md="6">
                  <date-picker
                    label="Sales date"
                    v-model="saleModel.saleDate"
                  ></date-picker>
                </v-col>
              </v-row>
              <v-row>
                <v-col md="12">
                  <v-text-field
                    label="Customer contact information"
                    clearable
                    v-model="saleModel.contactInfo"
                  />
                </v-col>
              </v-row>
              <v-row class="my-n6">
                <v-col md="12">
                  <v-textarea
                    label="Sales Address"
                    clearable
                    rows="1"
                    v-model="saleModel.address"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider class="mx-4" />

            <v-card-subtitle color="primary">
              <v-row>
                <v-col>Product</v-col>
                <v-col align="end" class="font-weight-black"
                  >Total: {{ saleTotal }}</v-col
                >
              </v-row>
            </v-card-subtitle>
            <v-card-text class="goods-table">
              <v-fab-transition>
                <v-btn
                  color="primary"
                  dark
                  absolute
                  right
                  fab
                  x-small
                  @click="addProduct"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-fab-transition>
              <v-data-table
                disable-pagination
                hide-default-footer
                :headers="productHeaders"
                :items="saleModel.products"
              >
                <template v-slot:item.index="{ item }">
                  {{ saleModel.products.indexOf(item) + 1 }}
                </template>
                <template v-slot:item.productName="props">
                  <v-edit-dialog
                    large
                    save-text="OK"
                    cancel-text="Cancel"
                    @save="confirmSelectsProduct(props.item)"
                  >
                    <span class="font-editable">{{
                      props.item.productName
                    }}</span>
                    <template v-slot:input>
                      <v-autocomplete
                        hide-no-data
                        v-model="selectedProduct"
                        label="Product"
                        clearable
                        item-value="productId"
                        item-text="productName"
                        :items="productItems"
                        :loading="searchLoading"
                        return-object
                        @keydown.enter="confirmSelectsProduct(props.item)"
                      >
                      </v-autocomplete>
                    </template>
                  </v-edit-dialog>
                </template>
                <template v-slot:item.salePrice="props">
                  <v-edit-dialog large save-text="OK" cancel-text="Cancel">
                    <span class="font-editable">
                      {{ props.item.salePrice }}</span
                    >
                    <template v-slot:input>
                      <v-text-field
                        label="Sales Unit Price"
                        type="number"
                        v-model="props.item.salePrice"
                      ></v-text-field>
                    </template>
                  </v-edit-dialog>
                </template>
                <template v-slot:item.amount="props">
                  <v-edit-dialog large save-text="OK" cancel-text="Cancel">
                    <span class="font-editable">{{ props.item.amount }}</span>
                    <template v-slot:input>
                      <v-text-field
                        label="quantity"
                        type="number"
                        :max="props.item.inventory"
                        v-model="props.item.amount"
                      ></v-text-field>
                    </template>
                  </v-edit-dialog> </template
                ><template v-slot:item.costTotal="{ item }">
                  {{ item.costPrice * item.amount }}
                </template>
                <template v-slot:item.saleTotal="{ item }">
                  {{ item.salePrice * item.amount }}
                </template>
                <template v-slot:item.profits="{ item }">
                  {{
                    item.salePrice * item.amount - item.costPrice * item.amount
                  }}
                </template>

                <template v-slot:item.data-item-reduce="{ item }">
                  <v-btn
                    v-if="saleModel.products.length > 1"
                    width="0"
                    height="0"
                    tile
                    fab
                    @click="reduceProduct(item)"
                  >
                    <v-icon color="error" small>mdi-close</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
          <v-divider class="mx-4" />
        </simple-form-navigation>
      </template>

      <template v-slot:data-expanded-item="{ item }">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>Product name</th>
                <th>Cost price</th>
                <th>Sales price</th>
                <th>Sales quantity</th>
                <th>Total cost price</th>
                <th>Total sales price</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in item.products" :key="product.productId">
                <td>{{ product.productName }}</td>
                <td>{{ product.costPrice }}</td>
                <td>{{ product.salePrice }}</td>
                <td>{{ product.amount }}</td>
                <td>{{ product.costTotal }}</td>
                <td>{{ product.saleTotal }}</td>
                <td>{{ product.profits }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <!-- {{ item.products }} -->
      </template>
    </crud-table>
  </v-card>
</template>

<script>
import CrudTable from "@/components/CrudTable";
import SimpleFormNavigation from "@/components/SimpleFormNavigation";
import request from "../../utils/request";
const DEFAULT_PRODUCT = {
  productId: 0,
  productName: "-",
  productNo: "-",
  inventory: 0,
  costPrice: 0,
  salePrice: 0,
  costTotal: 0,
  saleTotal: 0,
  amount: 0,
  profits: 0,
};
const DEFAULT_SALE_MODEL = {
  saleId: null,
  saleNo: "",
  saleDate: null,
  products: [
    {
      productId: 0,
      productName: "-",
      productNo: "-",
      inventory: 0,
      costPrice: 0,
      salePrice: 0,
      costTotal: 0,
      saleTotal: 0,
      amount: 0,
      profits: 0,
    },
  ],
};
export default {
  components: { CrudTable, SimpleFormNavigation },
  data: () => ({
    addDialog: false,
    saleModel: JSON.parse(JSON.stringify(DEFAULT_SALE_MODEL)),
    productHeaders: [
      {
        text: "Serial Number",
        align: "start",
        sortable: false,
        value: "index",
        width: "100",
      },
      {
        text: "Product Name",
        align: "start",
        sortable: false,
        value: "productName",
      },
      { text: "Product No.", value: "productNo", sortable: false },
      { text: "Current inventory", value: "inventory", sortable: false },
      { text: "cost unit price", value: "costPrice", sortable: false },
      { text: "Sales Unit Price", value: "salePrice", sortable: false },
      { text: "Sales Quantity", value: "amount", sortable: false },
      { text: "Cost Total", value: "costTotal", sortable: false },
      { text: "Sales Total", value: "saleTotal", sortable: false },
      { text: "profit", value: "profits", sortable: false },
      { text: "", value: "data-item-reduce", sortable: false, width: "1" },
    ],
    productItems: [],
    searchLoading: false,
    selectedProduct: {},
  }),
  computed: {
    saleTotal() {
      let total = 0;
      if (this.saleModel.products) {
        this.saleModel.products.forEach((item) => {
          total += Number(item.salePrice * item.amount);
        });
      }

      return total;
    },
  },
  mounted() {
    request
      .get("/rest/products/selections")
      .then((result) => {
        this.productItems = [...result];
      })
      .catch((err) => {
        console.warn(err);
      });
  },
  methods: {
    actionEvent(action, item) {
      switch (action) {
        case "add":
          this.addDialog = true;
          this.saleModel = JSON.parse(JSON.stringify(DEFAULT_SALE_MODEL));
          this.saleModel.saleDate = String(new Date());
          break;
        case "edit":
          this.saleModel.saleId = item.saleId;
          this.saleModel.saleNo = item.saleNo;
          this.saleModel.saleDate = item.saleDate;
          this.saleModel.address = item.address;
          this.saleModel.contactInfo = item.contactInfo;
          this.saleModel.products = item.products;
          this.addDialog = true;
          break;
        default:
          break;
      }
    },
    saveEntity() {
      return new Promise((resolve) => {
        if (this.beforeSave()) {
          this.getService()
            .save(this.saleModel)
            .then(() => {
              this.$toast.success("The operation was successful", {
                position: "top-center",
              });
              resolve();
            })
            .catch((err) => {
              this.$toast.error(err.message, {
                position: "top-center",
              });
              console.warn(err);
            });
        }
      });
    },
    beforeSave() {
      let validated = true;
      let productCheckIndex = [];
      this.saleModel.products.forEach((element, index) => {
        if (!element.productId || element.productId === 0) {
          validated = false;
          productCheckIndex.push(index + 1);
        }
      });

      if (!validated) {
        this.$toast.warning(
          `Please complete the first ${productCheckIndex.join(
            ","
          )} product information`,
          {
            position: "top-center",
          }
        );
      }
      return validated;
    },
    reload() {
      this.$refs.$crud$.reload();
    },
    confirmSelectsProduct(item) {
      if (!this.selectedProduct) {
        item = JSON.parse(JSON.stringify(DEFAULT_PRODUCT));
      } else {
        item.productId = this.selectedProduct.productId;
        item.productName = this.selectedProduct.productName;
        item.productNo = this.selectedProduct.productNo;
        item.costPrice = item.costPrice || this.selectedProduct.buyPrice;
        item.salePrice = item.salePrice || this.selectedProduct.salePrice;
        item.inventory = this.selectedProduct.inventory;
      }

      this.$nextTick(() => {
        this.selectedProduct = null;
      });
    },
    addProduct() {
      this.saleModel.products.push(JSON.parse(JSON.stringify(DEFAULT_PRODUCT)));
    },
    reduceProduct(item) {
      const editedIndex = this.saleModel.products.indexOf(item);
      this.saleModel.products.splice(editedIndex, 1);
    },
    getService() {
      return this.$refs["$crud$"].crudService;
    },
  },
};
</script>

<style>
.v-data-table__wrapper tbody tr:nth-child(2n + 1) {
  background: #f8f8f8 !important;
}
.font-editable {
  color: #80abfa;
  font-weight: bold;
}
</style>