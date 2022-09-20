/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#231D1B',
				secondary: '#FFDBCC',
				hover: '#FFFE51',
				background: '#1E1E1E',
			}
		},
	},
	plugins: [],
}
