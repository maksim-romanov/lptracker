import "reflect-metadata";

import "di/container";
import "expo-router/entry";

import "./src/styles/unistyles";

import numbro from "numbro";
import { container } from "tsyringe";

import { AppInitializeUseCase } from "domain/use-cases/app-initialize";
import { addressesStore } from "presentation/stores/addresses-store";
numbro.setLanguage("en");

container.resolve(AppInitializeUseCase).execute();
addressesStore.hydrate();
