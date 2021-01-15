<template>
  <div class="height-100pc">
    <v-card class="py-2 height-100pc crud-card" elevation="1">
      <!--Form-->
      <v-data-table
        class="elevation-0"
        fixed-header
        hide-default-footer
        :show-expand="showExpand"
        v-model="selected"
        :item-key="itemKey"
        :headers="headerArray"
        :items="records"
        :options.sync="pageOptions"
        :items-per-page="page.size"
        :loading="loading"
        :server-items-length="total"
        :show-select="Boolean(itemKey) && hasSelect"
        @dblclick:row="rowDbclick"
      >
        <!-- Form header -->
        <template v-slot:top>
          <v-text-field
            filled
            rounded
            dense
            clearable
            v-model="search"
            placeholder="Search"
            class="mx-4"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
          <!--Buttons and controls-->
          <v-row no-gutters justify="space-between" align="center" class="mx-2">
            <v-col>
              <ButtonRender :buttons="buttons" @buttonClick="doAction" />
            </v-col>
            <!--Rendering of controls-->
            <v-col align="end" class="pr-2">
              <template v-if="widgets && widgets.length > 0">
                <div class="col-item" @click="showFilter = !showFilter">
                  <v-icon small color="#8091a5">mdi-filter-menu-outline</v-icon>
                  filter
                </div>
                <FilterNavigation
                  v-model="showFilter"
                  :widgets="widgets"
                  :widget-model="queryParam"
                  @confirm="queryPage"
                />
                <span class="separator"></span>
              </template>

              <div class="col-item-readonly">
                Total <span class="total-count">{{ total }}</span
                >Data
              </div>
              <span class="separator"></span>
              <div class="col-item">
                <v-menu offset-y rounded="0">
                  <template v-slot:activator="{ on }">
                    <v-icon small color="#8091a5" v-on="on"
                      >mdi-cog-outline</v-icon
                    >
                  </template>
                  <v-list dense>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-subtitle class="setting-title">
                          Display quantity per page
                        </v-list-item-subtitle>
                        <div class="setting-content">
                          <template v-for="(perPage, index) in perPageOptions">
                            <span
                              :key="index"
                              :class="[
                                page.size === perPage ? 'per-current' : '',
                              ]"
                              @click="page.size = perPage"
                              >{{ perPage }}</span
                            >
                          </template>
                        </div>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-col>
          </v-row>
        </template>

        <!--Inline operation button event-->
        <template v-slot:[`item.actions`]="{ item }">
          <v-menu
            top
            offset-y
            rounded="0"
            transition="scale-transition"
            origin="left bottom"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn width="0" height="0" tile fab v-bind="attrs" v-on="on">
                <v-icon small>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item
                v-for="(operation, index) in actions"
                :key="index"
                @click="doAction(operation.action, item, operation)"
              >
                <v-list-item-title>{{
                  operation.text || operation.action
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <slot
              name="data-expanded-item"
              :headers="headers"
              :item="item"
            ></slot>
          </td>
        </template>
      </v-data-table>

      <!--Paging related components-->
      <v-row
        justify="end"
        no-gutters
        class="mb-n3 mr-5 crud-table-pagination"
        v-if="pageTotal > 1"
      >
        <!-- <v-col md="auto"> -->
        <v-pagination
          class="pa-2 page-selection v-size--small"
          prev-icon="mdi-menu-left"
          next-icon="mdi-menu-right"
          v-model="page.current"
          :length.sync="pageTotal"
          color="primary"
          :total-visible.sync="pageCount"
        />
        <!-- </v-col> -->
        <v-col md="auto">
          <v-text-field
            label="Jump to"
            style="width: 60px"
            type="number"
            class="mt-5"
            dense
            v-model="jumpToPage"
            @keydown="queryPage"
          />
        </v-col>
      </v-row>

      <slot name="add-dialog">
        <FormNavigation
          v-model="actionSwitch.add"
          :dialog-view="dialogView"
          :current-item="currentItem"
          @confirm="edit_"
        />
      </slot>
      <slot name="edit-dialog">
        <FormNavigation
          v-model="actionSwitch.edit"
          :dialog-view="dialogView"
          :current-item="currentItem"
          @confirm="edit_"
        />
      </slot>

      <slot name="delete-dialog">
        <tips-dialog
          v-model="actionSwitch.delete"
          width="300px"
          title="Are you sure you want to delete the current data item?"
          @confirm="delete_(currentItem)"
        />
      </slot>

      <slot name="delete-batch-dialog">
        <tips-dialog
          width="350px"
          v-model="actionSwitch.batchDelete"
          title="Are you sure you want to delete the currently selected data item?"
          @confirm="batchDelete_(selected)"
        />
      </slot>

      <slot name="import-dialog">
        <v-dialog v-model="actionSwitch.import" width="400">
          <v-card class="pa-2">
            <v-row no-gutters justify="space-between" align="center">
              <v-col md="6" align="center" class="import-col">
                <v-hover v-slot:default="{ hover }">
                  <div
                    class="import-item-box"
                    :class="{ 'on-hover': hover }"
                    @click="exportTemplate"
                  >
                    <div>
                      <v-icon color="primary" size="100"
                        >mdi-file-download-outline
                      </v-icon>
                    </div>
                    <div class="text">Download template</div>
                  </div>
                </v-hover>
              </v-col>

              <v-col md="6" align="center" class="import-col">
                <v-hover v-slot:default="{ hover }">
                  <div class="import-item-box" :class="{ 'on-hover': hover }">
                    <div>
                      <file-upload
                        ref="import-upload"
                        :headers="authHeanders"
                        :post-action="apiBase + namespace + '/import'"
                        @input-file="inputFile"
                        @input-filter="inputFilter"
                        class="import-upload"
                        v-model="importFiles"
                      >
                        <v-icon color="primary" size="100"
                          >mdi-file-upload-outline</v-icon
                        >
                      </file-upload>
                    </div>
                    <div class="text" style="margin-top: -8px">Upload data</div>
                  </div>
                </v-hover>
              </v-col>
            </v-row>
            <v-row no-gutters justify="space-between" align="center">
              <v-col md="12">
                <v-progress-linear
                  v-if="importFiles.length"
                  color="light-blue"
                  height="10"
                  :value="importFiles[0].progress"
                  striped
                ></v-progress-linear>
              </v-col>
            </v-row>
          </v-card>
        </v-dialog>
      </slot>
    </v-card>
  </div>
</template>

<script>
import { CrudService, mixins as crudMixins } from "@/api/crud";
import { convertWidget } from "@/utils/widget";
import TipsDialog from "@/components/TipsDialog";
import FormNavigation from "@/components/FormNavigation";
import ButtonRender from "@/components/ButtonRender";
import FilterNavigation from "@/components/FilterNavigation";
import FileUpload from "vue-upload-component";

crudMixins.methods.transform = convertWidget;

export default {
  name: "CrudTable",
  mixins: [crudMixins],
  components: {
    TipsDialog,
    FormNavigation,
    ButtonRender,
    FilterNavigation,
    FileUpload,
  },
  props: {
    //Header
    headers: {
      type: Array,
      default: () => [],
    },
    /**
     * Control
     */
    widgetModels: {
      type: Array,
      default: () => [],
    },
    /**
     * Top button
     */
    buttonModels: {
      type: Array,
      default: () => [],
    },
    showExpand: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    search: null,
    //Header array
    headerArray: [],
    //The number of items per page definition
    perPageOptions: [10, 20, 30],
    //The definition information of the page, external sorting, external part of the page, etc.
    pageOptions: {},
    // page information, query number, and current page
    page: {
      size: 10,
      current: 1,
    },
    //Page number to jump to
    jumpToPage: 1,
    //most
    pageCount: 10,
    //total pages
    pageTotal: 1,

    //Loading...
    loading: true,
    //total
    total: 0,
    //Record array
    records: [],
    //Is optional
    hasSelect: true,
    //Inline operation event button
    loadMethod: "queryPage",
    showFilter: false,
  }),
  watch: {
    namespace: "initCrud",
    "page.current": function (value, old) {
      if (value === old) {
        return;
      }
      this.jumpToPage = value;
      this.queryPage();
    },
    "page.size": function (value, old) {
      if (value === old) {
        return;
      }
      this.page.current = 1;
      this.queryPage();
    },
    jumpToPage: function (value, old) {
      if (
        value === old ||
        value < 1 ||
        value === "" ||
        value > this.pageTotal
      ) {
        return;
      }
      this.page.current = Number(value);
    },
    pageOptions: {
      handler(value, old) {
        if (!Object.keys(old).length) {
          return;
        }
        this.queryPage();
      },
      deep: true,
    },
  },
  created() {
    this.initCrud();
  },
  methods: {
    initCrud() {
      this.crudService = new CrudService(this.namespace);
      this.headerArray = this.headers;
      this.widgets = this.widgetModels;
      this.buttons = this.buttonModels;
      this.actions = [];
      this.pageOptions = {};
      this.queryPage();
    },
    queryPage() {
      this.loading = true;
      this.$vuetify.goTo(0, { offset: 0 });
      const queryParams = {
        ...this.page,
        ...this.queryParam,
        ...this.$route.query,
      };
      const sortBy = this.pageOptions.sortBy;
      if (sortBy && sortBy.length) {
        queryParams.sortBy = sortBy[0];
      }

      const sortDesc = this.pageOptions.sortDesc;
      if (sortDesc && sortDesc.length) {
        queryParams.sortDesc = sortDesc[0];
      }

      /**
       * Process the returned data
       * @param data return result
       */
      const handlerRecord = function (data) {
        const records = data.records;
        const recordExtend = data.recordExtend;
        if (recordExtend) {
          records.forEach((record) => {
            const extendData = recordExtend[record[data.itemKey]];
            if (extendData) {
              Object.keys(extendData).forEach((key) => {
                record[key] = extendData[key];
              });
            }
          });
        }
        return records;
      };

      this.crudService
        .list(queryParams)
        .then((data) => {
          this.total = data.total;
          this.itemKey = data.itemKey;
          this.hasSelect = data.hasSelect;
          this.records = handlerRecord(data);
          this.pageTotal = data.pages;
          if (data.dialogView) {
            this.dialogView = data.dialogView;
          }

          if (data.pages !== null && data.pages <= 10) {
            this.pageCount = data.pages || 1;
          }
          //If the header is not defined, use the data column
          if (!this.headerArray || this.headerArray.length === 0) {
            if (data.headers) {
              this.headerArray = data.headers;
            } else {
              const record = data.records[0];
              Object.keys(record).forEach((key) => {
                this.headerArray.push({ text: key, value: key });
              });
            }
          }

          //Initialize the control
          if ((!this.widgets || this.widgets.length === 0) && data.widgets) {
            this.widgets = data.widgets;
          }

          //Initialize button
          if ((!this.buttons || this.buttons.length === 0) && data.buttons) {
            this.buttons = data.buttons;
          }

          //Initialize column event
          if (
            (!this.actions || this.actions.length === 0) &&
            data.actions &&
            data.actions.length > 0
          ) {
            this.actions = data.actions;
            this.headerArray.unshift({
              text: "",
              value: "actions",
              class: "crud-actons-td",
              align: "start",
              sortable: false,
              width: "1",
            });
          }

          if (
            this.showExpand &&
            this.headerArray.filter(
              (item) => item.value === "data-table-expand"
            ).length === 0
          ) {
            this.headerArray.push({
              text: "",
              value: "data-table-expand",
              class: "crud-actons-td",
              align: "start",
              sortable: false,
              width: "1",
            });
          }

          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.$toast.error(err.message, {
            position: "top-center",
          });
        });
    },
    rowDbclick(event, rowObject) {
      //If there is an edit action, edit it directly when double-clicking
      if (
        this.actions &&
        this.actions.filter((ac) => "edit" === ac.action).length > 0
      ) {
        const editAction = { action: "edit", scirpt: false };
        this.doAction(editAction.action, rowObject.item, editAction);
      }
    },
  },
};
</script>

<style scoped>
body >>> .v-data-table__checkbox .mdi-checkbox-marked {
  color: #3582fb;
}

.page-selection >>> .v-pagination__item:focus {
  border: none !important;
}

.crud-table >>> .v-data-table__wrapper {
  overflow: hidden;
}

.crud-table >>> .v-icon {
  font-size: 16px;
}

.crud-table >>> .mdi-checkbox-marked {
  color: #3582fb;
}

.crud-table >>> .v-data-table__wrapper tbody tr:nth-child(2n + 1) {
  background: #f8f8f8;
}

/* .crud-table >>> tbody tr:hover {
    box-shadow: 0 3px 15px -2px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    background: #fff !important;
  } */

.crud-table >>> .crud-actons-td {
  padding: 0 1px !important;
}

.crud-table >>> .actions-menu {
  border-radius: none !important;
}

.col-item,
.col-item-readonly {
  display: inline-block;
  font-size: 14px;
  color: #8091a5;
  cursor: pointer;
}

.col-item:hover,
.col-item:hover > * {
  color: #3582fb !important;
}

.total-count {
  color: #000;
  padding: 0 5px;
}

.per-page {
  display: inline-block;
  width: 30px;
  height: 20px;
}

.separator {
  border-right: 1px solid #dfe6ee;
  width: 1px;
  height: 18px;
  margin-left: 15px;
  margin-right: 15px;
}

.setting-title {
  min-width: 20px;
  font-size: 12px;
  color: #8091a5;
}

.setting-content {
  margin-top: 5px;
}

.setting-content span {
  font-size: 12px;
  padding: 3px;
  cursor: pointer;
  margin: 0 1px;
  border: 1px solid #ebebeb;
}

.setting-content span:hover {
  background: #d7e6fe;
  color: #3582fb;
  border: 1px solid #3582fb !important;
  z-index: 1;
  cursor: pointer;
}

.per-current {
  background: #d7e6fe;
  color: #3582fb;
  border: 1px solid #3582fb !important;
  z-index: 1;
  cursor: default;
}

.crud-table >>> .v-progress-linear {
  height: 1px !important;
}

.crud-table >>> .v-data-table__expanded__content {
  box-shadow: unset;
}

.import-item-box {
  margin: 10px;
  cursor: pointer;
  background-color: #fafafa;
  transition: opacity 0.4s ease-in-out;
}

.import-item-box:not(.on-hover) {
  opacity: 0.6;
}

.import-upload >>> label {
  cursor: pointer;
}

.import-item-box .text {
  color: #80abfa;
  font-weight: bold;
  padding-bottom: 10px;
}
</style>