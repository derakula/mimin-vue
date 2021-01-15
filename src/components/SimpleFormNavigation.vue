<template>
  <v-navigation-drawer v-model="dialogSwitch" absolute temporary :width="width">
    <v-form ref="form">
      <slot />
      <v-spacer />
      <!-- button -->
      <v-container>
        <v-row justify="end">
          <v-col md="4" align="end">
            <v-btn
              small
              outlined
              tile
              class="mr-2"
              color="secondary"
              @click="toggleSwitch"
            >
              {{ cancelText }}
            </v-btn>
            <v-btn
              small
              tile
              class="mr-2"
              color="primary"
              @click="executeSuccess"
            >
              {{ saveText }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "SimpleFormNavigation",
  props: {
    value: Boolean,
    cancelText: {
      type: String,
      default: () => "Cancel",
    },
    width: {
      type: [Number, String],
      default: () => "500",
    },
    saveText: {
      type: String,
      default: () => "Save",
    },
    successAction: Function,
  },
  computed: {
    dialogSwitch: {
      get() {
        return this.value;
      },
      set(val) {
        //grants_ change is controlled by the parent component
        const form = this.$refs.form;
        if (form) {
          form.resetValidation();
        }

        this.$emit("input", val);
      },
    },
  },
  methods: {
    toggleSwitch() {
      this.dialogSwitch = !this.dialogSwitch;
    },
    executeSuccess() {
      let formValid = true;
      const form = this.$refs.form;
      if (form) {
        formValid = form.validate();
      }

      if (formValid) {
        if (this.successAction) {
          this.successAction().then(() => {
            this.toggleSwitch();
            //Callback for the completion of the entire submission process
            this.$emit("callback");
          });
        } else {
          this.toggleSwitch();
        }
      }
    },
  },
};
</script>

<style></style>