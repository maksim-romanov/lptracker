import "reflect-metadata";

import "di/container";
import "expo-router/entry";

import "./src/styles/unistyles";

import numbro from "numbro";
import { container } from "tsyringe";

import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { walletsStore } from "presentation/stores/wallets-store";
numbro.setLanguage("en");

container.resolve(AppInitializeUseCase).initialize();
walletsStore.hydrate();
