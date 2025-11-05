<template>
  <div class="mapty-app">
    <!-- Sidebar contains form, workout list, and buttons -->
    <div class="sidebar">
      <img src="/logo.png" alt="Logo" class="logo" />

      <!-- Remove all button, only shows when there are workouts -->
      <div class="custom-btns" :class="{ hidden: !showButtons }">
        <button class="custom-btn btn-reset" @click="reset">Remove all</button>
      </div>

      <!-- Workout form -->
      <ul class="workouts">
        <!-- Form toggles visibility using formHidden -->
        <form class="form" :class="{ hidden: formHidden }" @submit.prevent="newWorkout">
          <!-- Select workout type -->
          <div class="form-row">
            <label class="form-label">Type</label>
            <select v-model="form.type" class="form-input form-input-type" @change="toggleElevationField">
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
            </select>
          </div>

          <!-- Distance input -->
          <div class="form-row">
            <label class="form-label">Distance</label>
            <input v-model.number="form.distance" class="form-input form-input-distance" placeholder="km" />
          </div>

          <!-- Duration input -->
          <div class="form-row">
            <label class="form-label">Duration</label>
            <input v-model.number="form.duration" class="form-input form-input-duration" placeholder="min" />
          </div>

          <!-- Cadence only shows for running -->
          <div class="form-row" v-if="form.type === 'running'">
            <label class="form-label">Cadence</label>
            <input v-model.number="form.cadence" class="form-input form-input-cadence" placeholder="step/min" />
          </div>

          <!-- Elevation only shows for cycling -->
          <div class="form-row" v-if="form.type === 'cycling'">
            <label class="form-label">Elev Gain</label>
            <input v-model.number="form.elevation" class="form-input form-input-elevation" placeholder="meters" />
          </div>

          <button class="form-btn">OK</button>
        </form>

        <!-- Workout list items -->
        <li
          v-for="workout in workouts"
          :key="workout.id"
          :class="['workout', `workout--${workout.type}`]"
          @click="moveToPopup(workout)"
        >
          <h2 class="workout-title">{{ workout.description }}</h2>

          <!-- Edit & Delete buttons -->
          <div class="workout-btns">
            <button class="workout-btn workout-btn-edit">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="workout-btn workout-btn-delete" @click.stop="deleteWorkout(workout.id)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <!-- Common info (distance + duration) -->
          <div class="workout-details">
            <span class="workout-icon">{{ workout.type === "running" ? "🏃" : "🚴" }}</span>
            <span class="workout-value">{{ workout.distance }}</span>
            <span class="workout-unit">km</span>
          </div>
          <div class="workout-details">
            <span class="workout-icon">⏱</span>
            <span class="workout-value">{{ workout.duration }}</span>
            <span class="workout-unit">min</span>
          </div>

          <!-- Extra info for running -->
          <template v-if="workout.type === 'running'">
            <div class="workout-details">
              <span class="workout-icon">⚡️</span>
              <span class="workout-value">{{ workout.pace.toFixed(1) }}</span>
              <span class="workout-unit">min/km</span>
            </div>
            <div class="workout-details">
              <span class="workout-icon">🦶🏼</span>
              <span class="workout-value">{{ workout.cadence }}</span>
              <span class="workout-unit">spm</span>
            </div>
          </template>

          <!-- Extra info for cycling -->
          <template v-if="workout.type === 'cycling'">
            <div class="workout-details">
              <span class="workout-icon">⚡️</span>
              <span class="workout-value">{{ workout.speed.toFixed(1) }}</span>
              <span class="workout-unit">km/h</span>
            </div>
            <div class="workout-details">
              <span class="workout-icon">⛰</span>
              <span class="workout-value">{{ workout.elevationGain }}</span>
              <span class="workout-unit">m</span>
            </div>
          </template>
        </li>
      </ul>

      <!-- Footer -->
      <p class="copyright">
        &copy; Copyright by
        <a target="_blank" href="https://twitter.com/jonasschmedtman">Jonas Schmedtmann</a>.
        Use for learning or portfolio only.
      </p>
    </div>

    <!-- Map container -->
    <div id="map"></div>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* -----------------------------
   Workout Class (Base)
   ----------------------------- */
class Workout {
  date = new Date();
  id = Date.now().toString().slice(-10); // unique ID from timestamp
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  // Creates a readable description like "Running on June 5"
  setDescription() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

/* -----------------------------
   Running subclass
   ----------------------------- */
class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace(); // calculate pace when created
    this.setDescription();
  }
  calcPace() {
    // pace = minutes per km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

/* -----------------------------
   Cycling subclass
   ----------------------------- */
class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed(); // calculate speed when created
    this.setDescription();
  }
  calcSpeed() {
    // speed = km per hour
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

export default {
  name: "MaptyApp",
  data() {
    return {
      map: null, // Leaflet map instance
      mapEvent: null, // click event for form location
      mapZoomLevel: 13,
      workouts: [], // all workout objects
      markers: [], // store map markers for each workout
      formHidden: true, // hides/shows form
      showButtons: false, // shows 'Remove all' button
      form: {
        type: "running",
        distance: "",
        duration: "",
        cadence: "",
        elevation: "",
      },
    };
  },
  mounted() {
    this.getPosition(); // get user's current location on mount
    this.getLocalStorage(); // load saved workouts
  },
  methods: {
    // Get user geolocation
    getPosition() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.loadMap,
          () => alert("Could not get your position!")
        );
      }
    },

    // Initialize map with user's position
    loadMap(position) {
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      // Create Leaflet map
      this.map = L.map("map").setView(coords, this.mapZoomLevel);

      // Add OpenStreetMap tiles
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // When map is clicked, show the form
      this.map.on("click", this.showForm);

      // Re-render markers for workouts loaded from local storage
      this.workouts.forEach((work) => this.renderWorkoutMarker(work));
    },

    // Show the form where user clicked on the map
    showForm(e) {
      this.mapEvent = e;
      this.formHidden = false;
      // Focus the distance input automatically
      this.$nextTick(() => document.querySelector(".form-input-distance").focus());
    },

    // Hide the form and clear all input values
    hideForm() {
      Object.keys(this.form).forEach((key) => (this.form[key] = ""));
      this.formHidden = true;
    },

    // When user switches type, clear irrelevant field
    toggleElevationField() {
      this.form.type === "running"
        ? (this.form.elevation = "")
        : (this.form.cadence = "");
    },

    // Create new workout object (running or cycling)
    newWorkout() {
      const { type, distance, duration, cadence, elevation } = this.form;
      const { lat, lng } = this.mapEvent.latlng;
      const valid = (...inputs) => inputs.every((i) => Number.isFinite(i));
      const positive = (...inputs) => inputs.every((i) => i > 0);
      let workout;

      // Create Running workout
      if (type === "running") {
        if (!valid(distance, duration, cadence) || !positive(distance, duration, cadence))
          return alert("Invalid input!");
        workout = new Running([lat, lng], +distance, +duration, +cadence);
      }
      // Create Cycling workout
      else {
        if (!valid(distance, duration, elevation) || !positive(distance, duration))
          return alert("Invalid input!");
        workout = new Cycling([lat, lng], +distance, +duration, +elevation);
      }

      // Save workout
      this.workouts.push(workout);
      this.renderWorkoutMarker(workout);
      this.setLocalStorage(); // persist data
      this.hideForm();
      this.showButtons = true;
    },

    // Show marker popup on the map
    renderWorkoutMarker(workout) {
      const marker = L.marker(workout.coords)
        .addTo(this.map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
          })
        )
        .setPopupContent(
          `${workout.type === "running" ? "🏃" : "🚴"} ${workout.description}`
        )
        .openPopup();

      marker.markID = workout.id;
      this.markers.push(marker);
    },

    // Move map view to clicked workout’s location
    moveToPopup(workout) {
      this.map.setView(workout.coords, this.mapZoomLevel, {
        animate: true,
        pan: { duration: 1 },
      });
    },

    // Save workouts to local storage
    setLocalStorage() {
      localStorage.setItem("workouts", JSON.stringify(this.workouts));
    },

    // Load workouts from local storage
    getLocalStorage() {
      const data = JSON.parse(localStorage.getItem("workouts"));
      if (!data) return;
      this.workouts = data;
      this.showButtons = true;
    },

    // Delete all workouts
    reset() {
      localStorage.removeItem("workouts");
      this.workouts = [];
      this.markers.forEach((m) => m.remove());
      this.markers = [];
      this.showButtons = false;
    },

    // Delete single workout
    deleteWorkout(id) {
      this.workouts = this.workouts.filter((w) => w.id !== id);
      localStorage.setItem("workouts", JSON.stringify(this.workouts));

      // Remove its map marker
      const marker = this.markers.find((m) => m.markID === id);
      if (marker) marker.remove();

      // If no more workouts left, hide buttons
      if (!this.workouts.length) {
        this.showButtons = false;
        localStorage.removeItem("workouts");
      }
    },
  },
};
</script>

<style scoped>
@import "leaflet/dist/leaflet.css";
/* ===== Bankist App Base ===== */
.bankist-app {
  font-family: 'Poppins', sans-serif;
  background: #f3f3f3;
  color: #333;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.4s ease-in-out;
}

/* ===== Login Screen ===== */
.login {
  background: white;
  padding: 2.5rem 3rem;
  border-radius: 1rem;
  box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.1);
  width: 350px;
  text-align: center;
  opacity: 1;
  transition: opacity 0.4s ease;
}

.login h2 {
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  color: #222;
}

/* Input styling (works with your dynamic components) */
.login input {
  width: 100%;
  padding: 0.8rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  outline: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login input:focus {
  border-color: #33b249;
  box-shadow: 0 0 4px rgba(51, 178, 73, 0.3);
}

/* Buttons */
.login button {
  width: 100%;
  padding: 0.9rem;
  background-color: #33b249;
  color: white;
  border: none;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login button:hover {
  background-color: #2da13f;
}

/* ===== App Section ===== */
.app {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0.8rem 2rem rgba(0, 0, 0, 0.1);
  width: 800px;
  max-width: 90%;
  opacity: 1;
  transition: opacity 0.4s ease;
}

/* For fade in/out opacity toggle */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== Movements / Transactions ===== */
.movements {
  margin-top: 2rem;
}

.movements h3 {
  margin-bottom: 1rem;
  color: #444;
}

.movement {
  display: flex;
  justify-content: space-between;
  background-color: #f8f8f8;
  padding: 0.8rem 1.2rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: transform 0.2s ease;
}

.movement:hover {
  transform: scale(1.02);
}

/* ===== Balance Section ===== */
.balance {
  margin-top: 1.5rem;
  font-weight: 600;
  font-size: 1.2rem;
  color: #222;
}

.balance .value {
  color: #33b249;
  font-size: 1.4rem;
}

/* ===== Utility ===== */
.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
