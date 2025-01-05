import { LocationProvider, Router, Route, hydrate, prerender as ssr } from 'preact-iso';

import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';
import './style.css';
import ControllerProvider from './providers/ControllerProvider.js';
import SocketProvider from './providers/SocketProvider.js';
import AccelerationProvider from "./providers/AccelerationProvider";

export function App() {
	return (

		<LocationProvider>
			<main>
				<Home />
			</main>
			<ControllerProvider />
			<SocketProvider />
			<AccelerationProvider />
		</LocationProvider>

	);
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
