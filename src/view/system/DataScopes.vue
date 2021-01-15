// Data range management list
<template>
  <div class="height-100pc">
    <crud-table
      namespace="/rest/scopes"
      :exclude-actions="['edit']"
      @action="actionEvent"
      ref="$crud$"
    >
      <template v-slot:add-dialog>
        <simple-form-navigation
          v-model="addDialog"
          width="800"
          :successAction="saveEntity"
          @callback="reload"
        >
          <v-card elevation="0">
            <v-card-subtitle>Basic information</v-card-subtitle>
            <v-card-text>
              <v-text-field
                label="Data range name"
                :rules="[
                  (v) =>
                    (v !== undefined && v !== null && v !== '') ||
                    `Data range name cannot be empty`,
                ]"
                clearable
                v-model="scopeEntity.scopeName"
              />
              <v-text-field
                label="description"
                clearable
                v-model="scopeEntity.describe"
              />
            </v-card-text>

            <v-divider class="mx-4" />

            <v-card-subtitle color="primary"
              >Data range setting</v-card-subtitle
            >
            <v-card-text>
              <v-row class="pa-4">
                <!--Organization Selection-->
                <v-col cols="6" class="select-container">
                  <tree-model
                    :value="scopeEntity.selectedOrganIds"
                    :display-root="true"
                    :return-object="false"
                    select-type="independent"
                    namespace="/rest/organs"
                    :selectable="true"
                    :searchable="true"
                    @selection="selection"
                    @nodeActive="treeNodeActive"
                  />
                </v-col>

                <v-divider vertical />
                <v-col cols="5" class="mt-0 ml-3 align-center">
                  <template v-if="scopeRuleShow">
                    <div>Scope rules</div>
                    <v-divider />
                    <v-radio-group
                      class="ml-1"
                      :row="true"
                      v-model="
                        scopeEntity.scopeDefinesMap[selected]['scopeRule']
                      "
                      :mandatory="true"
                    >
                      <v-radio label="contains" value="0" />
                      <v-radio label="Exclude" value="1" />
                    </v-radio-group>
                  </template>

                  <template v-if="scopeTypeShow">
                    <div>Range type</div>
                    <v-divider />
                    <!--Selection of data range type-->
                    <v-checkbox
                      class="ml-3 mb-n4"
                      v-for="(scopeType, index) in scopeTypes"
                      :key="index"
                      dense
                      v-model="scopeEntity.scopeDefinesMap[selected]['types']"
                      :value="scopeType.code"
                      :label="scopeType.text"
                    />
                  </template>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </simple-form-navigation>
      </template>
    </crud-table>
  </div>
</template>

<script>
import CrudTable from "../../components/CrudTable";
import TreeModel from "../../components/TreeModel";
import { getScopeTypes } from "../../api/auth";
import SimpleFormNavigation from "@/components/SimpleFormNavigation";

const DEFAULT_ENTITY = {
  scopeId: null,
  scopeName: "",
  describe: "",
  selectedOrganIds: [],
  scopeDefinesMap: {},
};

export default {
  name: "DataScopes",
  components: { CrudTable, TreeModel, SimpleFormNavigation },
  data: () => ({
    addDialog: false,
    scopeEntity: JSON.parse(JSON.stringify(DEFAULT_ENTITY)),
    open: [],
    scopeTypes: [],
    selected: {},
    //Observe whether the data has been prepared and continue, mainly for the update control of dynamic array objects
    hasReadiness: false,
  }),
  computed: {
    scopeRuleShow: function () {
      return (
        this.selected &&
        this.scopeEntity.scopeDefinesMap[this.selected] &&
        this.hasReadiness
      );
    },
    scopeTypeShow: function () {
      return (
        this.scopeTypes &&
        this.scopeTypes.length > 0 &&
        this.selected &&
        this.scopeEntity.scopeDefinesMap[this.selected] &&
        this.hasReadiness
      );
    },
  },
  watch: {
    selected: {
      handler(nodeId) {
        if (nodeId) {
          this.initNodeScopeDefine(nodeId);
        }
      },
    },
  },
  methods: {
    //Initialize the necessary data
    initNecessary() {
      getScopeTypes().then((data) => {
        this.scopeTypes = data;
      });
    },
    //Events executed
    actionEvent(action, item) {
      switch (action) {
        case "add": {
          this.scopeEntity = JSON.parse(JSON.stringify(DEFAULT_ENTITY));
          this.addDialog = true;
          break;
        }
        case "edit": {
          const scopeDefinesMap = {},
            selectedOrganIds = [];
          if (item.scopeDefines && item.scopeDefines.length > 0) {
            item.scopeDefines.forEach((scopeDefine) => {
              selectedOrganIds.push(scopeDefine.organId);
              scopeDefinesMap[scopeDefine.organId] = {
                scopeRule: String(scopeDefine.scopeRule),
                types: scopeDefine.scopeTypes || [],
              };
            });
          }
          this.scopeEntity = {
            ...item,
            scopeDefinesMap: scopeDefinesMap,
            selectedOrganIds: selectedOrganIds,
          };
          this.$nextTick(() => {
            this.addDialog = true;
          });

          break;
        }
        default:
      }
    },
    treeNodeActive(nodeIds) {
      this.selected = nodeIds && nodeIds.length > 0 ? nodeIds[0] : null;
    },
    selection(nodes) {
      if (nodes) {
        this.scopeEntity.selectedOrganIds = nodes;
      }
    },
    //The definition rules of the data range of the initialization node
    initNodeScopeDefine(nodeId) {
      if (!this.scopeEntity.scopeDefinesMap[nodeId]) {
        this.hasReadiness = false;
        this.scopeEntity.scopeDefinesMap[nodeId] = {
          scopeRule: "0",
          types: [],
        };
        this.$nextTick(() => {
          this.hasReadiness = true;
        });
      }
    },
    saveEntity() {
      const submitEntity = { ...this.scopeEntity };
      submitEntity.scopeDefines = Object.keys(submitEntity.scopeDefinesMap).map(
        (scopeDefineId) => {
          const scopeDefinesMapElement =
            submitEntity.scopeDefinesMap[scopeDefineId];
          return {
            scopeId: submitEntity.scopeId,
            organId: scopeDefineId,
            scopeRule: scopeDefinesMapElement.scopeRule,
            scopeTypes: scopeDefinesMapElement.types || [],
          };
        }
      );
      return new Promise((resolve) => {
        this.$refs["$crud$"].crudService
          .save(submitEntity)
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
          });
      });
    },
    reload() {
      this.$refs["$crud$"].reload();
    },
  },
  created() {
    this.initNecessary();
  },
};
</script>

<style scoped>
.select-container {
  height: 320px !important;
  overflow: auto !important;
  width: 100% !important;
}
</style>