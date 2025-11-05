<template>
  <div class="summary">
    <p>
      <strong>In:</strong> <span>{{ formattedIncomes }}</span>
    </p>
    <p>
      <strong>Out:</strong> <span>{{ formattedOut }}</span>
    </p>
    <p>
      <strong>Interest:</strong> <span>{{ formattedInterest }}</span>
    </p>
  </div>
</template>

<script>
// for currency
import {formatCurrency} from "../Recipes/helpers.js"

export default {
  name: "MovementSummary",
 props: {
    account: { type: Object, required: true },
    // for currency
    locale: { type: String, default: "en-PH" },
    currency: { type: String, default: "PHP" },
  },

  computed: {
    incomes() {
      if (!this.account?.movements) return 0;
      return this.account.movements
        .filter(mov => mov.amount > 0)
        .reduce((acc, mov) => acc + mov.amount, 0);
    },

    out() {
      if (!this.account?.movements) return 0;
      return this.account.movements
        .filter(mov => mov.amount < 0)
        .reduce((acc, mov) => acc + mov.amount, 0);
    },

    interest() {
      if (!this.account?.movements) return 0;
      return this.account.movements
        .filter(mov => mov.amount > 0)
        .map(dep => (dep.amount * this.account.interestRate) / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0);
    },

    formattedIncomes() {
      return this.formatCurrency(this.incomes);
    },
    formattedOut() {
      // for currency 
      // remove negative for out
      return this.formatCurrency(Math.abs(this.out));
    },
    formattedInterest() {
      return this.formatCurrency(this.interest);
    },
  },

  methods: {
    // for currency
    formatCurrency(value) {
      return formatCurrency(value, this.locale, this.currency);
    },
  },
};
</script>

<style scoped>
.summary {
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  background: #fafafa;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.summary p {
  margin: 0;
  font-size: 1.1rem;
}

.summary span {
  font-weight: bold;
}
</style>
