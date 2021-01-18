<template>
  <div class="py-2 px-2 height-100pc user-center" elevation="1">
    <v-row justify="space-between">
      <v-col md="3">
        <v-card shaped>
          <v-img
            :style="{ 'background-image': usercard }"
            height="250"
            class="user-card-img"
          >
            <div class="text-center mt-2">
              <img
                class="avatar-img"
                v-if="profileForm.avatar"
                :src="profileForm.avatar"
              />
              <v-icon v-else size="190" color="#fff">mdi-account-circle</v-icon>
            </div>
            <div class="my-2 text-center font-weight-bold">
              {{ userInfo.displayName }}
            </div>
          </v-img>

          <v-card-text>
            <div v-for="(line, index) in cardlines" :key="index">
              <div class="py-2">
                <v-icon small left>{{ line.icon }}</v-icon
                >{{ line.text }}
              </div>
              <v-divider />
            </div>
            <div class="mb-3"></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-tabs>
            <v-tab>My Activity</v-tab>
            <v-tab>Personal Settings</v-tab>
            <v-tab>Change Password</v-tab>

            <!-- My activity -->
            <v-tab-item>
              <v-card flat class="pa-3">
                <v-timeline>
                  <v-timeline-item
                    v-for="(log, index) in accessLogs"
                    :key="index"
                    small
                  >
                    <template v-slot:icon> </template>
                    <span slot="opposite">{{ log.createTime }}</span>
                    <v-card class="elevation-2">
                      <v-card-title class="headline">{{
                        log.resourceName || log.url
                      }}</v-card-title>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-card>
            </v-tab-item>

            <!-- Personal settings -->
            <v-tab-item>
              <v-card flat class="pa-3">
                <v-row>
                  <v-col md="6">
                    <v-form ref="form">
                      <!-- Field rendering -->
                      <v-container>
                        <v-row>
                          <v-col md="12">
                            <v-text-field
                              label="Display Name"
                              :rules="profileRules.displayName"
                              v-model="profileForm.displayName"
                              clearable
                            />
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-col>
                  <v-col md="6">
                    <avatar-upload
                      tips-text="Drag or click to upload pictures"
                      v-model="profileForm.avatar"
                    />
                  </v-col>
                </v-row>
                <v-divider />
                <v-row justify="end">
                  <v-col md="4" align="end">
                    <v-btn
                      small
                      outlined
                      tile
                      class="mr-2"
                      color="secondary"
                      @click="resetProfile"
                    >
                      Reset
                    </v-btn>
                    <v-btn
                      small
                      tile
                      class="mr-2"
                      color="primary"
                      @click="saveProfile"
                    >
                      save
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>

            <!-- Change password -->
            <v-tab-item>
              <v-card
                flat
                class="pa-3"
                v-if="userInfo.firebase.sign_in_provider == 'password'"
              >
                <v-row justify="center" align="center">
                  <v-col md="6">
                    <v-form ref="passwordForm">
                      <!-- Field rendering -->
                      <v-container>
                        <v-row>
                          <v-col md="12">
                            <v-text-field
                              label="Old password"
                              :rules="passwordRules.oldPassword"
                              v-model="passwordForm.oldPassword"
                              type="password"
                              clearable
                            />
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col md="12">
                            <v-text-field
                              label="new password"
                              :rules="passwordRules.newPassword"
                              v-model="passwordForm.newPassword"
                              id="newPassword"
                              type="password"
                              clearable
                            />
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col md="12">
                            <v-text-field
                              label="Confirm password"
                              :rules="passwordRules.confirmPassword"
                              v-model="passwordForm.confirmPassword"
                              id="confirmPassword"
                              type="password"
                              clearable
                            />
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-col>
                </v-row>
                <v-row justify="end">
                  <v-col md="4" align="end">
                    <v-btn
                      small
                      tile
                      class="mr-2"
                      color="primary"
                      @click="passwordUpate"
                    >
                      save
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
              <v-card flat class="pa-3" v-else>
                <p class="text-center">You're logged in using {{ userInfo.firebase.sign_in_provider }} </p>
                <p class="text-center">To be able to change your password you must use your email and password at login.</p>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {
  getAccessLogsByUserId,
  saveUserProfile,
  updatePassword,
} from "@/api/user";
import AvatarUpload from "@/components/AvatarUpload";
import { required } from "@/utils/widget";

import firebase from "firebase/app";
import "firebase/auth";

export default {
  name: "UserCenter",
  components: {
    AvatarUpload,
  },
  data() {
    return {
      alert: false,
      usercard: "",
      userInfo: {},
      cardlines: [],
      tabItems: [
        { tab: "logs", text: "My Activity" },
        { tab: "profile", content: "Personal Settings" },
        { tab: "password", content: "Change Password" },
      ],
      accessLogs: [],
      profileForm: {
        user_id: "",
        displayName: "",
        mobile: "",
        email: "",
        avatar: "",
      },
      profileRules: {
        displayName: [required("displayName")],
      },
      passwordForm: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      passwordRules: {
        oldPassword: [required("Old Password")],
        newPassword: [],
        confirmPassword: [],
      },
    };
  },
  mounted() {
    this.initBaseInfo();
    this.initAccessLogs();
    this.initPasswordRules();
  },
  methods: {
    initBaseInfo() {
      this.userInfo = this.$store.getters.user;
      this.usercard = "https://source.unsplash.com/500x500/daily";
      this.resetProfile();

      this.cardlines = [
        {
          icon: "mdi-card",
          text: this.userInfo.name,
        },
        {
          icon: "mdi-email",
          text: this.userInfo.email,
        },
        {
          icon: "mdi-account-tie-outline",
          text:
            this.userInfo.user_role == 1
              ? "Administrator"
              : this.userInfo.roles
              ? this.userInfo.roles.map((item) => item.roleName)
              : "no",
        },
        {
          icon: "mdi-update",
          text: `Join in ${this.userInfo.createdTime}`,
        },
      ];
    },
    initAccessLogs() {
      getAccessLogsByUserId(this.userInfo.user_id)
        .then((result) => {
          this.accessLogs = result.records;
        })
        .catch((err) => {
          console.warn(err);
        });
    },
    saveProfile() {
      if (this.$refs.form.validate()) {
        var user = firebase.auth().currentUser;

        user
          .updateProfile({
            displayName: this.profileForm.displayName,
          })
          .then(() => {
            this.$store.dispatch("autoSignIn", {
              name: this.profileForm.displayName,
            });
            this.initBaseInfo();

            this.$toast.success("Save successfully", {
              position: "top-center",
            });
          })
          .catch((err) => {
            this.$toast.error(err.message, {
              position: "top-center",
            });
          });
      }
    },
    passwordUpate() {
      if (this.$refs.passwordForm.validate()) {
        updatePassword(this.passwordForm).catch((err) => {
          console.warn(err);
          this.$toast.success(err.message, {
            position: "top-center",
          });
        });
      }
    },
    resetProfile() {
      this.profileForm = {
        user_id: this.userInfo.user_id,
        displayName: this.userInfo.name,
        mobile: this.userInfo.mobile,
        email: this.userInfo.email,
        avatar: this.userInfo.picture || "",
      };
    },
    checkNewPassword(passwordFormfield) {
      const _this = this;
      const getField = function () {
        return _this.passwordForm[passwordFormfield];
      };

      return function (v) {
        const field = getField();
        const checkResult = !field || v === field;

        if (_this.$refs.passwordForm) {
          const targetInput = _this.$refs.passwordForm.inputs.filter(
            (input) => input.id === passwordFormfield
          )[0];

          if (v === field && !targetInput.valid) {
            targetInput.resetValidation();
          }
        }

        return checkResult || `The two entered passwords are not consistent`;
      };
    },
    initPasswordRules() {
      this.passwordRules.newPassword = [
        required("new password"),
        this.checkNewPassword("confirmPassword"),
      ];
      this.passwordRules.confirmPassword = [
        required("Confirm Password"),
        this.checkNewPassword("newPassword"),
      ];
    },
  },
};
</script>

<style>
.user-card-img {
  opacity: 0.8 !important;
  background-size: 100%;
}

.avatar-img {
  width: 170px;
  border-radius: 50%;
}
</style>