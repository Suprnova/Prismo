<script>
    import { onMount } from "svelte";

    import { backupDir } from '../scripts/store.js';

    let directoryPath
    let confirmRights = false
    let backup = false
    // change this to a cookie from settings
    let seed
    let itemRandomization = true
    let itemLogic = [
          { id: 0, name: "None" }
        , { id: 1, name: "Standard" }
    ]
    let itemPool = [
          { id: 1, name: "Standard" }
        , { id: 2, name: "Expanded" }
        // , { id: 3, name: "Custom" }
    ]
    let npcRandomization = true
    let npcLogic = [
          { id: 0, name: "Standard" }
        // , { id: 1, name: "Custom" }
        , { id: 2, name: "Guntsanity" }
    ]
    let lspCaveRandomization = false
    let nightmareCastleRandomization = false
    let castleBasementRandomization = false
    let spoilerLog = true

    let dir
    let backupDirectory
    let selectedILogic = itemLogic.find(x => x.id === 1)
    let selectedIPool = itemPool.find(x => x.id === 1)
    let selectedNLogic = npcLogic.find(x => x.id === 0)

    let successfullyLoaded = false

    const fileList = ["overworld_forest_cave.pak", "overworld_forest_cave_2.pak", "overworld_forest_master.pak", "overworld_iceking_cave.pak", "overworld_kingdom_master.pak", "overworld_mountain_cave_1.pak", "overworld_mountain_cave_3.pak", "overworld_mountain_cave_4.pak", "overworld_mountain_master.pak", "overworld_swamp_master.pak", "overworld_wasteland_cave_1.pak", "temple_dream_master.pak", "temple_fear_master.pak", "temple_song_master.pak", "castle_nightmare_master.pak", "overworld_lsp_cave.pak", "castle_basement_master.pak"]
    const fileContents = new Map()

    async function getFile() {
        if (typeof(window.showDirectoryPicker) === 'undefined') {
            alert("Your browser doesn't support the File System Access API. Please use the latest version of Chrome, Opera, or Edge.")
            document.querySelector('#directory-path').value = "Error: File System Access API not supported"
            return
        }
        // open file picker
        dir = await window.showDirectoryPicker({ mode: 'readwrite' });
        console.log(dir)
        directoryPath = "Loading from " + dir.name + "..."
        for await (const entry of dir.values()) {
            if (fileList.includes(entry.name)) {
                const fileHandle = await dir.getFileHandle(entry.name, { create: false })
                const file = await fileHandle.getFile()
                fileContents.set(file.name, "temp")
            }
        }

        console.log(fileContents)
        // todo: implement backup
        if (fileContents.size < 17) {
            alert("You are missing some files. Please make sure you have all the files in the folder.")
            return
        }
        directoryPath = fileContents.size.toString() + " files successfully loaded!"
        successfullyLoaded = true
    }

    async function randomize(e) {
        e.preventDefault()

        if (backup) {
            backupDirectory = await dir.getDirectoryHandle($backupDir, { create: true });
            for await (const entry of dir.values()) {
                if (fileList.includes(entry.name)) {
                    const fileHandle = await dir.getFileHandle(entry.name, { create: false })
                    const file = await fileHandle.getFile()
                    if (backup) {
                        fileContents.set(file.name, await file.arrayBuffer())
                    }
                }
            }
            for (let [name, bytes] of fileContents) {
                const backupFile = await backupDirectory.getFileHandle(name, { create: true })
                const backupWritable = await backupFile.createWritable()
                await backupWritable.write(bytes)
                await backupWritable.close()
            }
            console.log("Backup finished!")
        }

        const endpoint = import.meta.env.PUBLIC_RANDOMIZER_ENDPOINT
        const req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                seed: (seed === undefined) ? String(Math.floor(Math.random() * 1000000000)) : seed,
                itemRandomization: (itemRandomization ? 1 + selectedILogic.id : 0),
                itemPool: selectedIPool.id,
                npcRandomization: (npcRandomization ? 1 + selectedNLogic.id : 0),
                lspCaveRandomization: (lspCaveRandomization ? 1 : 0),
                nightmareCastleRandomization: (nightmareCastleRandomization ? 1 : 0),
                castleBasementRandomization: (castleBasementRandomization ? 1 : 0),
                spoilerLog: (spoilerLog ? 1 : 0)
            })
        }

        console.log("Sending randomization request...")
        fetch(endpoint, req)
            .then((res) => {
                if (!res.ok) {
                    alert("There was an error attempting to randomize your files! (" + res.status + " " + res.statusText +") Please try again later, or let us know about it!")
                    throw Error(response.statusText);
                }
                return res.json()
            })
            .then(async (body) => {
                console.log("Randomized files received!")
                for await (const entry of dir.values()) {
                    if (body[entry.name] != undefined) {
                        const fileHandle = await dir.getFileHandle(entry.name, { create: false })
                        const writer = await fileHandle.createWritable()
                        await writer.write(body[entry.name])
                        console.log(body[entry.name])
                        await writer.close()
                    }
                }
                if (spoilerLog) {
                    dir.getFileHandle("spoilerLog.txt", { create: true })
                    .then(async (fileHandle) => {
                        const writer = await fileHandle.createWritable()
                        await writer.write(body["spoilerLog"])
                        await writer.close()
                    })
                }
                console.log("Done randomizing files!")
            });
    }

    onMount(async () => {
        const button = document.querySelector('#open-files');
        button.addEventListener('click', function(e) {
            e.preventDefault()
            getFile()
        });
    })
</script>

<style type="text/postcss">
	.single-input {
		@apply flex flex-col w-full self-center items-center mb-6;
	}

	.multi-input {
		@apply flex w-full self-center justify-center mb-6;
	}

	.input-label {
		@apply block mb-2 text-sm font-medium text-gray-300;
	}

	.text-input-group {
		@apply flex flex-wrap w-1/2 justify-center;
	}

	.text-input {
		@apply w-3/4 text-sm text-gray-400 bg-gray-700 border-gray-600 rounded-lg border cursor-text focus:outline-none;
	}

	.checkbox-group {
		@apply inline-flex items-center flex-wrap;
	}

    .randomizeButton {
        @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
    }

        .randomizeButton:disabled {
            @apply bg-gray-500 cursor-not-allowed;
        }

	input[type="checkbox"] {
		@apply h-5 w-5 accent-secondary;
	}
</style>

<main class="w-full self-center">
    <form on:submit={randomize}>
		<div class="single-input">
			<label class="input-label" for="directory-path">Select AT3 <code>data</code> directory...</label>
			<div class="text-input-group">
				<input disabled class="text-input !cursor-not-allowed" id="directory-path" bind:value={directoryPath} type="text">
				<button class="bg-secondary hover:bg-hover text-gray-900 font-bold py-2 px-4 rounded" id="open-files">Browse...</button>
			</div>
			<label class="checkbox-group py-4">
				<input type="checkbox" bind:checked={confirmRights} id="confirmRights"><span class="ml-2 text-gray-300">I understand that I must have a legal copy of AT3 in order to use this randomizer.</span>
			</label>
            <label class="checkbox-group py-4">
				<input type="checkbox" bind:checked={backup} id="backup"><span class="ml-2 text-gray-300">Backup files to {$backupDir} folder</span>
			</label>
		</div>
		<div class="single-input">
			<label class="input-label" for="seed">Seed (Leave empty for random seed)</label>
			<div class="text-input-group">
				<input class="text-input py-2" id="seed" bind:value={seed} type="text">
			</div>
		</div>
		<div class="multi-input gap-24 md:gap-48">
			<label class="checkbox-group">
				<input type="checkbox" bind:checked={itemRandomization}><span class="ml-2 text-gray-300">Item Randomization</span>
			</label>
			<label class="checkbox-group">
				<input type="checkbox" bind:checked={npcRandomization}><span class="ml-2 text-gray-300">NPC Randomization</span>
			</label>
		</div>
		<div class="multi-input gap-24 md:gap-48">
			<div>
				<label class="input-label" for='item-logic'>Item Logic</label>
                <select bind:value={selectedILogic} disabled={!itemRandomization} class="rounded font-semibold bg-secondary disabled:bg-gray-500" id="item-logic">
                    {#each itemLogic as option}
                        <option value={option}>{option.name}</option>
                    {/each}
                </select>
			</div>
			<div>
				<label class="input-label" for='item-pool'>Item Pool</label>
                <select bind:value={selectedIPool} disabled={!itemRandomization} class="rounded font-semibold bg-secondary disabled:bg-gray-500" id="item-pool">
                    {#each itemPool as option}
                        <option value={option}>{option.name}</option>
                    {/each}
                </select>
			</div>
			<div>
				<label class="input-label" for='npc-logic'>NPC Logic</label>
                <select bind:value={selectedNLogic} disabled={!npcRandomization} class="rounded font-semibold bg-secondary disabled:bg-gray-500" id="npc-logic">
                    {#each npcLogic as option}
                        <option value={option}>{option.name}</option>
                    {/each}
                </select>
			</div>
		</div>
		<div class="multi-input gap-18 md:gap-36">
			<label class="checkbox-group">
				<input type="checkbox" bind:checked={lspCaveRandomization}><span class="ml-2 text-gray-300">Randomize LSP Cave</span>
			</label>
			<label class="checkbox-group">
				<input type="checkbox" bind:checked={nightmareCastleRandomization}><span class="ml-2 text-gray-300">Randomize Nightmare Castle</span>
			</label>
			<label class="checkbox-group">
				<input type="checkbox" bind:checked={castleBasementRandomization}><span class="ml-2 text-gray-300">Randomize Castle Basement</span>
			</label>
		</div>
		<div class="flex w-full self-center justify-center my-12">
			<label class="checkbox-group">
				<input type="checkbox" bind:checked={spoilerLog}><span class="ml-2 text-gray-300">Generate Spoiler Log</span>
			</label>
		</div>
		<div class="single-input">
			<button class="randomizeButton" disabled={!confirmRights || (!itemRandomization && !npcRandomization) || !successfullyLoaded} id="randomize" data-submit="...Sending">Randomize</button>
		</div>
	</form>
</main>