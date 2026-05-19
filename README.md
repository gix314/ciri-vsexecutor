# Ciri VSExecutor
The rewrite version of [egoDtheTurtle's vsexecutor](https://github.com/egoDtheTurtle/vsexecutor).

## Features
* Execute script directly via Visual Studio Code
* Debug console display in-game errors and bugs in VScode console
* Supports multiple instances
    * Can choose which client to execute script on

## Installation
1. Install [ciri-vsexecutor.vsix](https://github.com/gix314/ciri-vsexecutor/releases).
2. Open Visual Studio Code (VSC) and navigate to Extensions. Click on the three-dot menu (...) at the top-right corner, then select the option "Install from VSIX..." and choose the vsexecutor.vsix file you just downloaded.
3. Place the following script inside your executor's autoexec folder:
```lua
loadstring(game:HttpGet("https://raw.githubusercontent.com/gix314/ciri-vsexecutor/main/src/lua_handler.lua"))()
```

## Usage

- In Visual Studio Code, you should see the "Execute" or "No Clients" button at the bottom (Status Bar), or simply press `F1` and type "Execute Script", then press Enter to run the script.
- Press `Ctrl` + `` ` `` to open the Terminal. Then go to the "Output" section, where you will find a dropdown showing outputs from other extensions. Select `ciri-vs`, and your in-game Roblox developer console data will be synced with the console. Note: This will only sync client (executor) outputs. To also sync the game's console output, add the following line at the top of the loadstring script (inside the autoexec folder):
```lua
getgenv().LogGameOutput = true
```

## Troubleshooting

**The Execute button is stuck at "No Clients" - Can't execute the script**

1. Make sure you have joined Roblox with the loadstring script placed inside the autoexec folder.
2. Try to disable your firewall (completely).
3. Close all the VSCode tabs (File -> Exit).
4. Add this line at the top of the loadstring script (inside the autoexec folder):
```lua
getgenv().EthernetIPv4 = "Your Ethernet IPv4"`
```
To find your Ethernet IPv4, install and run [EthernetIPv4.exe](https://github.com/egoDtheTurtle/vsexecutor/releases).


If the above methods doesn't work, it might be because the executor/emulator does not support localhost connection. Try using a different executor/emulator.