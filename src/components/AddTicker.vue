<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер {{ ticker }}</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            @input="input"
            @keydown.enter="add"
            v-model="ticker"
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
          />
          <div
            style="
              display: flex;
              justify-content: space-evenly;
              align-items: center;
              padding: 2px;
            "
          >
            <button
              @click="
                ticker = 'BTC';
                add();
              "
              type="button"
              style="
                background: lightgray;
                border-radius: 10px;
                margin: 2px;
                padding: 2px 15px;
              "
            >
              BTC
            </button>
            <button
              @click="
                ticker = 'DOGE';
                add();
              "
              type="button"
              style="
                background: lightgray;
                border-radius: 10px;
                margin: 2px;
                padding: 2px 15px;
              "
            >
              DOGE
            </button>
            <button
              @click="
                ticker = 'ETH';
                add();
              "
              type="button"
              style="
                background: lightgray;
                border-radius: 10px;
                margin: 2px;
                padding: 2px 15px;
              "
            >
              ETH
            </button>
          </div>
        </div>
        <add-ticker-button @click="add" :disabled="disabled" />
      </div>
    </div>
  </section>
</template>

<script>
import AddTickerButton from "./AddTickerButton.vue";

export default {
  components: {
    AddTickerButton,
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length > 0,
  },

  data() {
    return {
      ticker: null,
    };
  },

  methods: {
    add() {
      if (!this.ticker) return;
      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },
  },

  watch: {
    ticker() {
      this.ticker = this.ticker.toUpperCase();
    },
  },
};
</script>
