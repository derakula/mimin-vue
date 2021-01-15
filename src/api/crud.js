import request, { download } from "../utils/request";
import { API_BASE_PATH } from "../config/app.config";

const ScriptHandler = {
  execute(scriptStr, options) {
    // eslint-disable-next-line no-new-func
    return Function('"use strict";return (' + scriptStr + ")")()(options);
  },
  executeEl(callObject, logicStr) {
    return Function(
      '"use strict";return (function(){ return ' + logicStr + "})"
    )().call(callObject);
  },
};
/**
 * Ordinary CRUD logic
 */
export class CrudService {
  constructor(namespace) {
    this.namespace = namespace;
  }

  /**
   * List query
   * @param query query parameters
   */
  list(query = {}) {
    return request.get(this.namespace, { params: query });
  }

  /**
   * Save
   * @param data new data
   */
  save(data) {
    return request.post(this.namespace, data);
  }

  /**
   * Get the entity of the object
   * @param id entity ID
   */
  getEntity(id) {
    return request.get(`${this.namespace}/${id}`);
  }

  /**
   * delete data
   * @param id
   */
  delete(id) {
    return request.delete(`${this.namespace}/${id}`);
  }

  /**
   * batch deletion
   * @param keys Id data to be deleted
   */
  batch_delete(keys = []) {
    return request.post(`${this.namespace}/batch_delete`, keys);
  }

  /**
   * Update
   * @param data updated data
   */
  update(data) {
    return request.put(this.namespace, data);
  }
}

/**
 * Tree CRUD logic
 */
export class TreeService extends CrudService {
  constructor(namespace) {
    super(namespace);
  }

  /**
   * Load tree
   * @param query query conditions
   */
  load(query) {
    return request.get(`${this.namespace}/tree`, { params: query });
  }

  /**
   * Load subclasses according to parent ID
   * @param key parent ID
   */
  loadChildren(key) {
    return request.get(`${this.namespace}/tree/${key}`);
  }

  /**
   * Node move
   * @param currentId current node ID
   * @param moveToId moves to the ID of a node
   */
  move(currentId, moveToId) {
    return request.put(`${this.namespace}/tree/move`, { currentId, moveToId });
  }

  /**
   * Re-initialize the tree, re-order
   */
  init() {
    return request.post(`/${this.namespace}/tree/init`);
  }
}

export default (namespace) => {
  return new CrudService(namespace);
};

/**
 * Default CRUD general data
 */
const DEFAULT_COMMON_DATA = {
  apiBase: API_BASE_PATH,
  authHeanders: {},
  //Importing files
  importFiles: [],
  //The key used to define the selected object
  itemKey: "",
  //The currently selected or edited object
  currentItem: {},
  //Crud service class
  crudService: {},
  //Event execution switch, used to process Dialog
  actionSwitch: {
    add: false,
    edit: false,
    delete: false,
    batchDelete: false,
    import: false,
  },
  activeAction: "",
  //ID of selected object
  selected: [],
  //Query parameters
  queryParam: {},
  //Top controls, such as name input query, list selection, etc.
  widgets: [],
  //Top button
  buttons: [],
  //Inline operation, object operation
  actions: [],
  loadMethod: "load",
  dialogView: {
    width: 800,
    fullscreen: false,
    editFields: [],
  },
};

/**
 * CRUD mixed in
 */
export const mixins = {
  props: {
    //Namespace, corresponding to the background RESTFULTCRUD, such as the user is /rest/users
    namespace: String,
    excludeActions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return JSON.parse(JSON.stringify(DEFAULT_COMMON_DATA));
  },
  mounted() {
    this.authHeanders = this.$store.state.user.token
      ? { Authorization: "Bearer " + this.$store.state.user.token }
      : {};
  },
  methods: {
    doAction(action, item, operator) {
      if (operator.script) {
        this.currentItem = item;

        if (action.startsWith("function")) {
          ScriptHandler.execute(action, this);
        } else {
          ScriptHandler.executeEl(this, action);
        }
      }
      if (!(this.excludeActions.indexOf(action) > -1)) {
        const actionMethod = this[action] || this["defaultAction"];
        actionMethod(action, item);
      }

      this.$emit("action", action, item);
    },
    defaultAction(action) {
      this.actionSwitch[action] = true;
    },
    resetActionSwitch() {
      Object.keys(this.actionSwitch).forEach(
        (key) => (this.actionSwitch[key] = false)
      );
    },
    add(action) {
      this.currentItem = {};
      this.defaultAction(action);
    },
    reload() {
      this[this.loadMethod]();
      this.resetActionSwitch();
    },
    edit_(item) {
      this.crudService
        .save(item)
        .then(() => {
          this.$toast.success("The operation was successful", {
            position: "top-center",
          });
          this.reload();
        })
        .catch((err) => {
          this.$toast.error(err.message, {
            position: "top-center",
          });
          console.warn(err);
        });
    },
    edit(action, item) {
      if (!item[this.itemKey]) {
        return;
      }

      //Judge whether to reacquire
      if (this.dialogView.reGet) {
        this.crudService.get(item[this.itemKey]).then((resultItem) => {
          this.currentItem = resultItem;
          this.defaultAction(action);
        });
      } else {
        this.currentItem = JSON.parse(JSON.stringify(item));
        this.defaultAction(action);
      }
    },
    delete(action, item) {
      this.currentItem = JSON.parse(JSON.stringify(item));
      this.defaultAction(action);
    },
    delete_(item) {
      this.crudService
        .delete(item[this.itemKey])
        .then(() => {
          this.$toast.success("The operation was successful", {
            position: "top-center",
          });
          this.reload();
        })
        .catch((err) => {
          this.$toast.error(err.message, {
            position: "top-center",
          });
          console.warn(err);
        });
    },
    batchDelete(action) {
      if (!this.selected || this.selected.length === 0) {
        // this.showTips("Please check the data items that need to be deleted");
        this.$toast.info("Please check the data items that need to be deleted", {
          position: "top-center",
        });
      } else {
        this.defaultAction(action);
      }
    },
    batchDelete_(items) {
      let ids = items;
      if (typeof items[0] === "object") {
        ids = items.map((item) => item[this.itemKey]);
      }

      this.crudService
        .batch_delete(ids)
        .then(() => {
          this.reload();
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    import(action) {
      this.defaultAction(action);
    },
    inputFile(newFile) {
      if (newFile && !newFile.active) {
        // Obtain the corresponding data
        this.$refs["import-upload"].active = true;
      }
    },
    inputFilter() { },
    exportTemplate() {
      download(`${this.namespace}/export`);
    },
    export() {
      download(`${this.namespace}/export`);
    },
  },
};