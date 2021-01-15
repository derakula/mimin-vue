<template>
  <div class="tree-model">
    <v-text-field
      v-if="searchable"
      class="tree-search-text elevation-0"
      dense
      v-model="search"
      label="node query"
      clearable
      close-delay
      clear-icon="mdi-close-circle-outline"
      append-icon="mdi-magnify"
    />
    <v-treeview
      class="hover-pointer"
      item-disabled="locked"
      hoverable
      rounded
      :return-object="returnObject"
      v-model="selection"
      :search="search"
      :activatable="activatable"
      :selection-type="selectType"
      :dense="isDense"
      :selectable="selectable"
      :multiple-active="multipleActive"
      :items="items"
      :filter="filterFunc"
      :open.sync="open"
      :open-all="openAll"
      :load-children="loadChildren"
      :item-key="itemKey"
      :item-text="itemText"
      selected-color="primary"
      @update:active="updateActive"
    >
      <!-- <template v-slot:prepend="{ item }">
        <v-icon
          small
          v-text="`mdi-${item.children?'home-variant':'folder-network'}`"
        />
      </template> -->

      <template v-slot:label="{ item }">
        <div
          class="hover-pointer font-size-14"
          @dblclick="$emit(`nodeDbClick`, item)"
        >
          {{ item[itemText] }}
        </div>
      </template>
    </v-treeview>
  </div>
</template>

<script>
import { TreeService } from "../api/crud";

export default {
  name: "TreeModel",
  props: {
    value: Array,
    dense: Boolean,
    openDeep: Number,
    openAll: {
      type: Boolean,
      defalut: () => false,
    },
    displayRoot: Boolean,
    treeItem: Object,
    modelText: String,
    modelKey: String,
    /**
     * The extension method of node processing is used for processing when obtaining nodes, there may be special node processing methods for extension
     */
    nodeHandleWrapper: Function,
    searchable: {
      type: Boolean,
      default: () => false,
    },
    //Whether to return the object
    returnObject: {
      type: Boolean,
      default: () => true,
    },
    activatable: {
      type: Boolean,
      default: () => true,
    },
    filter: {
      type: Function,
      default: () =>
        function (item, search, textKey) {
          return !search || item[textKey].indexOf(search.trim()) > -1;
        },
    },
    namespace: {
      type: String,
      default: () => "",
    },
    multipleActive: {
      type: Boolean,
      default: () => false,
    },
    selectable: {
      type: Boolean,
      default: () => false,
    },
    //The selection method of tree model, leaf can only select child nodes, independent is optional
    selectType: {
      type: String,
      default: () => "leaf",
    },
  },
  data: () => ({
    isDense: true,
    itemKey: "",
    lazy: false,
    loading: true,
    itemText: "",
    items: [],
    selection: [],
    open: [],
    queryParam: {},
    search: null,
    openDeepNumber: 0,
  }),
  computed: {
    filterFunc() {
      return this.filter();
    },
  },
  watch: {
    value: function () {
      this.assignment();
    },
    selection: function () {
      this.$emit("selection", this.selection);
    },
  },
  created() {
    this.init();
  },
  methods: {
    //Value assignment
    assignment() {
      let valueAdapter = [];
      if (this.value.length > 0) {
        let valueElement = this.value[0];
        if (this.returnObject && !(valueElement instanceof Object)) {
          valueAdapter = this.value.map((itemKey) => ({
            [this.itemKey]: itemKey,
            id: itemKey,
          }));
        } else if (!this.returnObject && valueElement instanceof Object) {
          valueAdapter = this.value.map((item) => item[this.itemKey]);
        } else {
          valueAdapter = this.value;
        }
      }

      //Compare
      if (JSON.stringify(valueAdapter) === JSON.stringify(this.selection)) {
        return;
      }
      this.selection = valueAdapter;
    },
    init() {
      this.isDense = this.dense;
      if (!this.treeItem) {
        this.crudService = new TreeService(this.namespace);
        this.load();
      } else {
        this.handleNodes(this.treeItem, false);
        this.items.splice(0, 1, this.treeItem);
        this.itemText = this.modelText;
        this.itemKey = this.modelKey;
      }
    },
    load() {
      const vm = this;
      vm.loading = true;
      vm.crudService.load(vm.queryParam).then((data) => {
        vm.itemKey = data.itemKey;
        vm.itemText = data.itemText;
        vm.lazy = data.lazy;
        vm.open = [];
        vm.openDeepNumber = 0;
        const tree = data.tree;
        if (data.dialogView) {
          this.dialogView = data.dialogView;
        }

        if (tree) {
          const isOpen =
            this.openAll &&
            (!vm.lazy || Boolean(Object.keys(vm.queryParam).length));
          vm.handleNodes(tree, isOpen);

          //Whether to showRoot node
          if (data.displayRoot && this.displayRoot) {
            this.items.splice(0, 1, tree);
          } else {
            this.items = [...tree.children];
          }
        } else {
          vm.items = [];
        }

        //Initialize the control
        if ((!vm.widgets || vm.widgets.length === 0) && data.widgets) {
          vm.widgets = data.widgets;
        }

        //Initialize button
        if ((!vm.buttons || vm.buttons.length === 0) && data.buttons) {
          vm.buttons = data.buttons;
        }

        this.$nextTick(() => {
          this.assignment();
          this.loading = false;
        });
      });
    },
    loadChildren(node) {
      return new Promise((resolve) => {
        this.crudService.loadChildren(node[this.itemKey]).then((children) => {
          if (children) {
            children.forEach((child) => {
              this.handleNodes(child, this.lazy);
            });
          }
          node.children = children;
          resolve(node);
        });
      });
    },
    handleNodes(node, open) {
      if (node.leaf) {
        delete node.children;
      }

      if (node.children) {
        node.children.forEach((childNode) => {
          this.handleNodes(childNode, open);
        });

        if (open && !node.parentId) {
          this.open.push(this.returnObject ? node : node[this.itemKey]);
        }
      } else {
        delete node.children;
      }

      if (this.nodeHandleWrapper) {
        this.nodeHandleWrapper(node);
      }
    },
    updateActive(nodes) {
      this.$emit("nodeActive", nodes);
      this.$emit("input", nodes);
    },
  },
};
</script>

<style scoped>
.tree-model >>> .v-treeview-node__root {
  margin-top: 0;
  margin-bottom: 0;
  min-height: 30px;
}

.tree-model >>> .v-treeview-node__checkbox {
  font-size: 16px;
}

.tree-search-text {
  margin: 0 15px;
}
</style>