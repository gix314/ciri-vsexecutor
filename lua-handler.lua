local HttpService = game:GetService("HttpService")
local LogService = game:GetService("LogService")
local Player = game:GetService("Players").LocalPlayer

local function Connect()
    local ip = (getgenv and getgenv().EthernetIPv4) or "localhost"
    local port = 8080
    local ws
    
    local success, err = pcall(function()
        ws = WebSocket.connect("ws://" .. ip .. ":" .. tostring(port))
    end)

    if not success or not ws then return nil end

    ws:Send(HttpService:JSONEncode({
        type = "HANDSHAKE",
        name = Player.Name
    }))

    local logConnection = LogService.MessageOut:Connect(function(message, messageType)
        if getgenv and getgenv().LogGameOutput == false then return end
        if message:find("%[BRIDGE%]") or message:find("%[ciri%-vs%]") then return end
        
        pcall(function()
            if ws then
                ws:Send(HttpService:JSONEncode({
                    type = "LOG",
                    message = message,
                    logType = messageType.Name
                }))
            end
        end)
    end)

    local msgConnection = ws.OnMessage:Connect(function(msg)
        local ok, packet = pcall(function() return HttpService:JSONDecode(msg) end)
        if not ok or not packet or packet.type ~= "DATA" then return end

        local func, loadErr = loadstring(packet.data)
        if func then
            local env = setmetatable({getgenv = getgenv}, {__index = getfenv(0)})
            setfenv(func, env)
            task.spawn(pcall, func)
        end
    end)

    return ws, logConnection, msgConnection
end

task.spawn(function()
    while true do
        local ws, logConn, msgConn = Connect()
        
        if ws then
            local connectionOpen = true
            local closeConn = ws.OnClose:Connect(function() connectionOpen = false end)
            
            while connectionOpen do task.wait(1) end
            
            closeConn:Disconnect()
            logConn:Disconnect()
            msgConn:Disconnect()
        end
        
        task.wait(2)
    end
end)