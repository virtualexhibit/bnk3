<template>
  <div>
    <!-- Dynamic Nav Tabs -->
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li
        v-for="(tab, index) in bankistTabs.Tabs"
        :key="tab.id"
        class="nav-item"
        role="presentation"
      >
        <button
          class="nav-link"
          :class="{ active: index === 0 }"
          :id="`${tab.id}-tab`"
          data-bs-toggle="tab"
          :data-bs-target="`#${tab.id}`"
          type="button"
          role="tab"
          :aria-controls="tab.id"
          :aria-selected="index === 0 ? 'true' : 'false'"
        >
          {{ tab.label }}
        </button>
      </li>
    </ul>

    <!-- Dynamic Tab Content -->
    <div class="tab-content">
      <div
        v-for="(tab, index) in bankistTabs.Tabs"
        :key="tab.id"
        class="tab-pane fade"
        :class="{ show: index === 0, active: index === 0 }"
        :id="tab.id"
        role="tabpanel"
        :aria-labelledby="`${tab.id}-tab`"
      >
        <h4>{{ tab.title }}</h4>

        <div v-for="comp in tab.components" :key="comp.id">
          <component
            :is="comp.componentName"
            :item="comp"
            v-model="formData[comp.key]"
            @button-action="handleAction(comp.on?.action)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { BankistTabsRecipe } from "../Recipes/rBankistApps.js";
import TextInput from "../SubComponents/TextInput.vue";
import CommonButtons from "../SubComponents/CommonButtons.vue";
export default {
    name: "NavTabs",
  components: { TextInput, CommonButtons },

  data() {
    return {
      bankistTabs: BankistTabsRecipe,
      formData: {},
    };
  },
  methods: {
    handleAction(action) {
      if (!action) return;
      console.log(`Action triggered: ${action}`);
    },
  },
};
</script>


export const BankistTabsRecipe = {
  Tabs: [
    {
      id: "loan",
      title: "Request Loan",
      label: "Loan",
      components: [
        {
          id: 1,
          componentName: "TextInput",
          key: "loanAmount",
          directives: {
            type: "number",
            class: "loan-input",
            placeholder: "Enter amount",
          },
          display: { text: "Loan Amount:" },
        },
        {
          id: 2,
          componentName: "CommonButtons",
          directives: {
            type: "button",
            class: "loan-btn",
          },
          display: { text: "Request Loan" },
          on: { action: "loan" },
        },
      ],
    },
    {
      id: "transfer",
      title: "Transfer Money",
      label: "Transfer",
      components: [
        {
          id: 1,
          componentName: "TextInput",
          key: "transferTo",
          directives: {
            type: "text",
            class: "transfer-input",
            placeholder: "Recipient username",
          },
          display: { text: "Recipient:" },
        },
        {
          id: 2,
          componentName: "TextInput",
          key: "transferAmount",
          directives: {
            type: "number",
            class: "transfer-input",
            placeholder: "Amount",
          },
          display: { text: "Amount:" },
        },
        {
          id: 3,
          componentName: "CommonButtons",
          directives: {
            type: "button",
            class: "transfer-btn",
          },
          display: { text: "Transfer" },
          on: { action: "transfer" },
        },
      ],
    },
    {
      id: "close",
      title: "Close Account",
      label: "Close",
      components: [
        {
          id: 1,
          componentName: "TextInput",
          key: "closeUsername",
          directives: {
            type: "text",
            class: "close-input",
            placeholder: "Username",
          },
          display: { text: "Username:" },
        },
        {
          id: 2,
          componentName: "TextInput",
          key: "closePin",
          directives: {
            type: "password",
            class: "close-input",
            placeholder: "PIN",
          },
          display: { text: "PIN:" },
        },
        {
          id: 3,
          componentName: "CommonButtons",
          directives: {
            type: "button",
            class: "close-btn",
          },
          display: { text: "Close Account" },
          on: { action: "close" },
        },
      ],
    },
  ],
};