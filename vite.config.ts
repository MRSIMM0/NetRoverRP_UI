import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';


// https://vitejs.dev/config/
export default defineConfig({
	server: {
		proxy: {
		  '/api': {
			target: 'http://192.168.1.26:5000',
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/api/, ''),
		  },
		  '/socket.io': {
			target: 'http://192.168.1.26:5000',
			ws: true, // Enable websocket proxying for Socket.IO
		  },
		},
	  },
	plugins: [
		preact({
			prerender: {
				enabled: true,
				renderTarget: '#app',
				additionalPrerenderRoutes: ['/404'],
				previewMiddlewareEnabled: true,
				previewMiddlewareFallback: '/404',
			},
		}),
	],
});
