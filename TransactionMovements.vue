<template>
  <div class="movements">
    <h3>Transaction History</h3>
     <button class="btn-sort" @click="toggleSort">
        {{ sorted ? 'Unsort' : 'Sort by Amount ↑' }}
      </button>
    <ul>
      <li
        v-for="(mov, index) in displayedMovements"
        :key="index"
        :class= "getMovementClass(mov)"
      >
        <span>
          {{ mov.amount > 0 ? 'Deposit' : 'Withdrawal' }}
          ({{ formatDate(mov.date) }})
        </span>
        <strong>{{ formatCurrency(mov.amount) }}</strong>
      </li>
    </ul>

    <!-- Loan Request Section -->
    <div class="loan-section">
      <input
        type="number"
        v-model.number="loanAmount"
        placeholder="Enter loan amount"
        class="loan-input"
      />
      <button @click="emitLoanRequest" class="loan-btn">Request Loan</button>
    </div>
   
  </div>
</template>

<script>
// for currency
import {formatCurrency} from "../Recipes/helpers.js"
export default {
  name: "TransactionMovements",
  props: {
  movements: { type: Array, required: true },
  // for currency
  locale: { type: String, default: "en-PH" },
  currency: { type: String, default: "PHP" },
},
    data() {
    return {
      sorted: false,
      loanAmount: 0,
    };
  },
  computed: {
    displayedMovements() {
      if (this.sorted) {
        return [...this.movements].sort((a, b) => a.amount - b.amount);
      }
      return this.movements;
    },
  },
  methods: {
      toggleSort() {
    this.sorted = !this.sorted;
  },
    getMovementClass(mov) {
    return ["movement", mov.amount > 0 ? "deposit" : "withdrawal"];
  },
    formatDate(date) {
      const d = new Date(date);
      const calcDaysPassed = (date1, date2) =>
        Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

      const daysPassed = calcDaysPassed(new Date(), d);

      if (daysPassed === 0) return "Today";
      if (daysPassed === 1) return "Yesterday";
      if (daysPassed <= 7) return `${daysPassed} days ago`;

      return d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  },
    emitLoanRequest() {
    if (this.loanAmount <= 0) {
      alert("❌ Enter a valid loan amount!");
      return;
    }
    // Emit event and pass amount to parent
    this.$emit("loan-request", this.loanAmount);
    this.loanAmount = 0;
  },
  // for currency
   formatCurrency(value) {
    return formatCurrency(value, this.locale, this.currency);
  },
  },
};
</script>

<style scoped>
.movements {
  background: #fff;
  padding: 1.5rem;
  margin-top: 2rem;
  border-radius: 1rem;
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.05);
}

.movements h3 {
  margin-bottom: 1rem;
}

.btn-sort {
  background: #007bff;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
}

.movement {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.deposit strong {
  color: green;
}

.withdrawal strong {
  color: red;
}
</style>
