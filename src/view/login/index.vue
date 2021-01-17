<template>
  <v-container class="container--fluid fill-height sea-bg">
    <v-row no-gutters align="center" justify="center">
      <v-col cols="12" sm="8" md="4" lg="4">
        <v-card class="elevation-10 pa-3 z-index-99 color-white bg-white">
          <div class="logo-mount"></div>
          <v-card-text>
            <div id="system-title" class="layout column align-center mb-6">
              <v-img :src="logoSrc" height="30" width="150" />
            </div>
            <v-form @keydown.enter.native="login">
              <v-text-field
                outlined
                prepend-icon="mdi-account"
                label="Email"
                name="email"
                v-model="model.email"
                :error-messages="emailErrors"
                @input="$v.model.email.$touch()"
                @blur="$v.model.email.$touch()"
              />
              <v-text-field
                outlined
                clearable
                v-model="model.password"
                prepend-icon="mdi-lock"
                type="password"
                label="Password"
                name="password"
                :error-messages="passwordErrors"
                @input="$v.model.password.$touch()"
                @blur="$v.model.password.$touch()"
              />
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="primary"
              @click="login"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

export default {
  mixins: [validationMixin],
  data: () => ({
    logoSrc: require("../../assets/text.png"),
    model: {
      email: "",
      password: "",
    },
  }),
  validations: {
    model: {
      email: { required, email },
      password: { required },
    },
  },
  computed: {
    emailErrors() {
      const errors = [];
      if (!this.$v.model.email.$dirty) return errors;
      !this.$v.model.email.email && errors.push("Must be valid e-mail");
      !this.$v.model.email.required && errors.push("E-mail is required");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.model.password.$dirty) return errors;
      !this.$v.model.password.required && errors.push("Password is required");
      return errors;
    },
    user() {
      return this.$store.getters.user;
    },
    error() {
      return this.$store.getters.error;
    },
    loading() {
      return this.$store.getters.loading;
    },
  },
  watch: {
    user(value) {
      if (value !== null && value !== undefined) {
        this.$router.push("/dashboard");
      }
    },
    error(err) {
      if (err !== null) {
        this.$toast.error(err.message, {
          position: "top-center",
        });
      }
    },
  },
  methods: {
    handleResize() {
      this.$root.$emit("resized");
    },
    login() {
      this.$v.$touch();

      if (!this.$v.$invalid) {
        this.$store
          .dispatch("signUserIn", {
            email: this.model.email,
            password: this.model.password,
          })
          .then(() => {
            //this.$router.push("/dashboard");
          })
          .catch((err) => {
            console.warn(err);
            this.model.password = "";
          });
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped lang="scss">
.sea-bg {
  background: url(../../assets/cool-background.png) no-repeat;
  background-size: cover;
}

/* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
.color-white {
  background-color: #fff;
}
/*
.submit-btn {
  background: #536976;
  background: -webkit-linear-gradient(
    to right,
    #292e49,
    #536976
  );
  background: linear-gradient(to right, #292e49, #536976);
}
*/
input::-webkit-input-placeholder {
  color: rgba(255, 255, 255, 0.1) !important;
}

.logo-mount {
  position: relative;
}

.logo-mount:before {
  content: "";
  position: absolute;
  z-index: 2;
  top: -30px;
  left: 10px;
  width: 50px;
  height: 50px;
  background-image: url("../../assets/logo.png");
  background-size: 100% 100%;
  border-radius: 2px;
  transform: rotate(45deg);
}

.logo-mount:after {
  content: "";
  position: absolute;
  z-index: 1;
  top: 48px;
  left: 12px;
  width: 44px;
  height: 3px;
  background: #eaeaea;
  border-radius: 100%;
}
</style>
