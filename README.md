# Prismo

Prismo is a web application designed to randomize game files for Adventure Time: The Secret of the Nameless Kingdom (AT3). It uses a serverless function, [Prismo-Randomizer](https://github.com/suprnova/prismo-randomizer) (adapted from [colinthomas5's AT3 Randomizer script](https://github.com/colinthomas5/AT3-Randomizer)), designed to keep the website entirely static.

The webapp is publicly available on https://prismo.at, where you can randomize your own files yourself. You don't have to build the application unless you want to run and develop it locally.

# Build Instructions

> :warning: **You only have to do this if you're developing and running Prismo locally. See above for all other users.**

Clone the repository, then run `npm install` in the root of the project directory. Create a `.env` file, and create a variable called `PUBLIC_RANDOMIZER_ENDPOINT` with a value of the URL to the randomizer endpoint. Finally, run `npm run dev` to start a dev server at `localhost:3000`.

# License

This project is licensed under the [MIT](LICENSE) license.