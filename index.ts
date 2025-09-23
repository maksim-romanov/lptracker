// Crypto polyfill for ethers.js and other crypto libraries
// Must be imported before any crypto-dependent modules
import "react-native-get-random-values";
import "reflect-metadata";

import "di/container";
import "features/uniswap-v4/config/di-container";

import "expo-router/entry";

import "./src/styles/unistyles";

import numbro from "numbro";
import { container } from "tsyringe";

import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { walletsStore } from "presentation/stores/wallets-store";
numbro.setLanguage("en");

container.resolve(AppInitializeUseCase).initialize();
walletsStore.hydrate();
