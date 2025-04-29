<script setup>
import { ref } from 'vue';
import LeafletMap from '../components/LeafletMap.vue';
 
let coords = ref([59.42691, 24.74344]); // Initial map center
let zoom = ref(19);
let homeCoords = [59.378959, 24.710048];
let homePolygon = [
  // Updated coordinates to make a smaller polygon just around house #31
  [59.379121, 24.709992], // Top-left corner
  [59.379109, 24.710223], // Top-right corner
  [59.378663, 24.710121], // Bottom-right corner
  [59.378675, 24.709891], // Bottom-left corner
  [59.379121, 24.709992]  // Back to first point to close polygon
];
</script>
 
<template>
    <button class="button is-primary" @click="coords=homeCoords">Go to my home</button>
    <input type="range" min="1" max="19" step="1" v-model="zoom">
    <LeafletMap
        :center="coords"
        :zoom="zoom"
        :marker="homeCoords"
        :polygon="homePolygon"
    ></LeafletMap>
</template>