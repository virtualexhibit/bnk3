<template>
  <div class="bankist-app">
    <!-- LOGIN SCREEN -->
    <div v-if="!currentAccount" class="login">
      <h2>Log in to get started</h2>

      <!-- Render input fields dynamically -->
      <div v-for="(input, index) in recipe.Inputs" :key="index">
        <component
          :is="input.ComponentName"
          :item="input"
          v-model="form[input.key]"
        />
      </div>

      <!-- Render buttons dynamically -->
      <div v-for="(btn, index) in recipe.Buttons" :key="'btn-' + index">
        <component
          :is="btn.ComponentName"
          :item="btn"
          @action="handleAction(btn.on?.action)"
        />
      </div>
    </div>

    <!-- DASHBOARD SCREEN -->
    <div v-else class="dashboard">
      <h2>Welcome back, {{ currentAccount.owner.split(' ')[0] }} 👋</h2>
      <!-- Timer -->
      <AccountTimer @expired="handleSessionExpired" />

      <div class="balance">
        <p>Current Balance:</p>
        <h1>{{ formattedBalance  }}</h1>
      </div>

      <!-- for currency -->
      <TransactionMovements
        :movements="currentAccount.movements"
        :locale="currentAccount.locale"
        :currency="currentAccount.currency"
        @loan-request="requestLoan"
      />
      <!-- for currency -->
      <MovementSummary
        :account="currentAccount"
        :locale="currentAccount.locale"
        :currency="currentAccount.currency"
      />
    </div>
  </div>
</template>

<script>
import { BankistAppRecipe, accounts } from "./Recipes/rBankistApps.js";
import TextInput from "./SubComponents/TextInput.vue";
import CommonButtons from "./SubComponents/CommonButtons.vue";
import TransactionMovements from "./SubComponents/TransactionMovements.vue";
import MovementSummary from "./SubComponents/MovementSummary.vue";
import AccountTimer from "./SubComponents/AccountTimer.vue";
import NavTabs from "./SubComponents/NavTabs.vue";
// for currency
import {formatCurrency} from "./Recipes/helpers.js"

export default {
  name: "BankistApp",
  components: { AccountTimer, TextInput, NavTabs,CommonButtons, TransactionMovements, MovementSummary },

  data() {
    return {
      accounts,
      recipe: BankistAppRecipe,
      form: {
        loginUsername: "",
        loginPin: "",
      },
      currentAccount: null,
      currentBalance: 0, 
      summary: {
        incomes: 0,
        out: 0,
        interest: 0,
      },
    };
  },

 computed: {
  //for currency
    formattedBalance() {
    return formatCurrency(
      this.currentBalance,
      this.currentAccount.locale,
      this.currentAccount.currency
    );
  },
  },

  mounted() {
    this.createUsernames();
  },
  methods: {
    requestLoan(amount) {
      setTimeout(() => {
        const hasDeposit = this.currentAccount.movements.some(
          mov => mov.amount >= (amount * 10) / 100
        );

        if (hasDeposit) {
          this.currentAccount.movements.push({
            amount,
            date: new Date().toISOString(),
          });

          alert(`Loan of ₱${amount.toLocaleString()} approved!`);

          this.calcDisplayBalance(this.currentAccount);
        } else {
          alert("Loan denied. You must have a deposit ≥ 10% of requested amount.");
        }
      }, 1000);
    },
    //timer
   handleSessionExpired() {
      alert("⏰ Session expired!");
      this.currentAccount = null;
    },
    createUsernames() {
      this.accounts.forEach(acc => {
        acc.username = acc.owner
          .toLowerCase()
          .split(" ")
          .map(name => name[0])
          .join("");
      });
    },
    handleAction(action) {
      if (action === "login") this.login();
    },
    login() {
      const account = this.accounts.find(
        acc =>
          acc.username === this.form.loginUsername &&
          acc.pin === Number(this.form.loginPin)
      );

      if (account) {
        this.currentAccount = account;
        this.calcDisplayBalance(account);
        this.form.loginUsername = "";
        this.form.loginPin = "";
      } else {
        alert("Invalid credentials ❌");
      }
    },
    calcDisplayBalance(acc) {
      const total = acc.movements.reduce((acc, mov) => acc + mov.amount, 0);
      this.currentBalance = total;
    },
  
  },
};
</script>

<style scoped>
.bankist-app {
  background: #f3f3f3;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Poppins", sans-serif;
  color: #333;
}

.login, .dashboard {
  background: white;
  padding: 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 2rem 3rem rgba(0, 0, 0, 0.1);
  width: 400px;
}

.balance {
  margin-top: 2rem;
}

.movement {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}

.deposit strong {
  color: green;
}

.withdrawal strong {
  color: red;
}
</style>
