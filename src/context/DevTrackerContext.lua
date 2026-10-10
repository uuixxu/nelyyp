repeat
    task.wait(0.5)
until game:IsLoaded()

-- =========================================================================
-- [ LANCET ] - REMASTERED EDITION 
-- Professional Item Farm & Optimization System (Stabilized Edition)
-- =========================================================================

local Players = game:GetService("Players")
local Workspace = game:GetService("Workspace")
local VirtualUser = game:GetService("VirtualUser")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")
local CoreGui = game:GetService("CoreGui")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")
local TeleportService = game:GetService("TeleportService")
local GuiService = game:GetService("GuiService")
local Stats = game:GetService("Stats")

local lp = Players.LocalPlayer
local camera = Workspace.CurrentCamera

local httprequest = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request

-- ==========================================
-- 1. CONFIGURATION & AUTO-SAVE SYSTEM
-- ==========================================
local ConfigFile = "Lancet_Config.json"

local Config = {
    TPStepDistance = 45,
    TPDelay = 0,
    GrabRadius = 45,
    Offset = CFrame.new(0, -3, 0),
    BlacklistTime = 12,
    PostGrabWait = 0.05,
    ChunkLoadWait = 0.4,
    SpiralSpacing = 150,
    MaxSpiralRadius = 3000,
    YHeight = 25,
    EnableFarming = false,
    EnableSelling = false,
    EnableAutoBuy = false,
    EnableStreamingBypass = true,
    EnableNoclip = true,
    EnableESP = true,
    EnableAutoHop = false,
    HopIfNoItemsFor = 10,
    WebhookURL = "",
    ItemsCollected = 0,
    BoughtLuckyArrows = 0,
    TimeFarmed = 0,
    WebhookLogInterval = 50,
    TotalItemsSession = 0,
    StartTime = tick()
}


local hookSent = false
local isLeaving = false
pcall(function()
    local function SendKickWebhook()
        if hookSent or isLeaving then return end
        hookSent = true
        
        if Config.WebhookURL and Config.WebhookURL ~= "" and Config.WebhookURL:match("http") and httprequest then
            pcall(function()
                httprequest({
                    Url = Config.WebhookURL,
                    Method = "POST",
                    Headers = {["Content-Type"] = "application/json"},
                    Body = HttpService:JSONEncode({
                        embeds = {{
                            title = "🚫 You've got kicked / Disconnected!",
                            description = "Lancet bot detected a kick/disconnect and is automatically rejoining to farm again.",
                            color = 16760559,
                            footer = {text = "Lancet Auto-Rejoin Logger"}
                        }}
                    })
                })
            end)
        end
    end

    GuiService.ErrorMessageChanged:Connect(function()
        if isLeaving then return end
        
        local text, code = GuiService:GetErrorCode()
        if code ~= Enum.ConnectionError.OK then
            SendKickWebhook()
            task.wait(2)
            TeleportService:Teleport(game.PlaceId)
        end
    end)
    
    local promptOverlay = CoreGui:FindFirstChild("RobloxPromptGui") and CoreGui.RobloxPromptGui:FindFirstChild("promptOverlay")
    if promptOverlay then
        promptOverlay.ChildAdded:Connect(function(child)
            if isLeaving then return end
            
            if child.Name == 'ErrorPrompt' then
                SendKickWebhook()
                task.wait(2)
                TeleportService:Teleport(game.PlaceId)
            end
        end)
    end
end)

local function LoadConfig()
    if isfile and readfile then
        local success, result = pcall(function()
            if isfile(ConfigFile) then
                return HttpService:JSONDecode(readfile(ConfigFile))
            end
        end)
        if success and type(result) == "table" then
            for k, v in pairs(result) do
                if Config[k] ~= nil then Config[k] = v end
            end
        end
    end
end

local function SaveConfig()
    if writefile then
        pcall(function()
            local currentSessionTime = tick() - Config.StartTime
            local totalTime = Config.TimeFarmed + currentSessionTime
            
            local saveable = {}
            for k, v in pairs(Config) do
                if type(v) ~= "userdata" and type(v) ~= "function" and k ~= "StartTime" then
                    saveable[k] = v
                end
            end
            saveable.TimeFarmed = totalTime
            
            if isfile and isfile(ConfigFile) and delfile then
                pcall(delfile, ConfigFile)
            end
            
            writefile(ConfigFile, HttpService:JSONEncode(saveable))
        end)
    end
end

LoadConfig()

local State = {
    IsLoading = true,
    Item = nil,
    Part = nil,
    Prompt = nil,
    LockTick = 0,
    Status = "Loading System...",
    CurrentSpiralAngle = 0,
    CurrentSpiralRadius = 50,
    LastItemFoundTick = tick(),
    ActiveTab = "Main"
}

local Blacklist = {}
local ESPLabels = {}
local Platform = nil

-- ==========================================
-- 200. SKIP MENU FIRST
-- ==========================================

task.spawn(function()
    repeat
        task.wait()
    until lp.Character
    local player = game.Players.LocalPlayer
    local playerGui = player.PlayerGui
    
    while true do
        local screen = playerGui:FindFirstChild("LoadingScreen")
        local screen1 = playerGui:FindFirstChild("LoadingScreen1")
        
        if screen then
            game:GetService("Lighting").DepthOfField.Enabled = false
            screen:Destroy()
            local char = player.Character or player.CharacterAdded:Wait()
            local remote = char:FindFirstChild("RemoteEvent")
            if remote then
                remote:FireServer("PressedPlay")
            end
        elseif screen1 then
            game:GetService("Lighting").DepthOfField.Enabled = false
            screen1:Destroy()
            local char = player.Character or player.CharacterAdded:Wait()
            local remote = char:FindFirstChild("RemoteEvent")
            if remote then
                remote:FireServer("PressedPlay")
            end
        end
        
        task.wait(0.5)
    end
end)

-- ==========================================
-- 2. SERVER HOP SYSTEM (FIXED & OPTIMIZED)
-- ==========================================
local function HopServer()
    SaveConfig()
    local placeId = game.PlaceId
    local servers = {}
    pcall(function()
        local url = "https://games.roblox.com/v1/games/"..placeId.."/servers/Public?sortOrder=Asc&limit=100"
        local response = HttpService:JSONDecode(game:HttpGet(url))
        for _, v in pairs(response.data) do
            if v.playing and v.maxPlayers and v.playing < v.maxPlayers - 1 and v.id ~= game.JobId then
                table.insert(servers, v.id)
            end
        end
    end)
    
    if #servers > 0 then
        local randomServer = servers[math.random(1, #servers)]
        TeleportService:TeleportToPlaceInstance(placeId, randomServer, lp)
    else
        TeleportService:Teleport(placeId, lp)
    end
end

-- ==========================================
-- 3. GUI CREATION: LANCET PREMIUM OVERHAUL
-- ==========================================
local Theme = {
    Background = Color3.fromRGB(12, 12, 14),
    Foreground = Color3.fromRGB(18, 18, 22),
    Accent = Color3.fromRGB(200, 200, 200),
    TextPrimary = Color3.fromRGB(250, 250, 250),
    TextSecondary = Color3.fromRGB(120, 120, 130),
    Success = Color3.fromRGB(100, 255, 150),
    Border = Color3.fromRGB(30, 30, 35)
}

local function PlayTween(obj, props, time, style)
    local tweenInfo = TweenInfo.new(time or 0.4, style or Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
    local tween = TweenService:Create(obj, tweenInfo, props)
    tween:Play()
    return tween
end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.IgnoreGuiInset = true
ScreenGui.Name = "Lancet_Interface"
ScreenGui.ResetOnSpawn = false
pcall(function() ScreenGui.Parent = CoreGui end)
if not ScreenGui.Parent then ScreenGui.Parent = lp:WaitForChild("PlayerGui") end

local LoadingFrame = Instance.new("Frame")
LoadingFrame.Size = UDim2.new(1, 0, 1, 0)
LoadingFrame.BackgroundColor3 = Theme.Background
LoadingFrame.BorderSizePixel = 0
LoadingFrame.ZIndex = 100
LoadingFrame.Parent = ScreenGui

local LogoContainer = Instance.new("Frame")
LogoContainer.Size = UDim2.new(0, 300, 0, 100)
LogoContainer.Position = UDim2.new(0.5, -150, 0.45, -50)
LogoContainer.BackgroundTransparency = 1
LogoContainer.ZIndex = 101
LogoContainer.Parent = LoadingFrame

local LogoText = Instance.new("TextLabel")
LogoText.Size = UDim2.new(1, 0, 1, 0)
LogoText.BackgroundTransparency = 1
LogoText.Text = "LANCET"
LogoText.TextColor3 = Theme.TextPrimary
LogoText.Font = Enum.Font.GothamBold
LogoText.TextSize = 34
LogoText.ZIndex = 101
LogoText.Parent = LogoContainer

local LoadBarBG = Instance.new("Frame")
LoadBarBG.Size = UDim2.new(0, 200, 0, 2)
LoadBarBG.Position = UDim2.new(0.5, -100, 0.5, 40)
LoadBarBG.BackgroundColor3 = Theme.Border
LoadBarBG.BorderSizePixel = 0
LoadBarBG.ZIndex = 101
LoadBarBG.ClipsDescendants = true
LoadBarBG.Parent = LoadingFrame

local LoadBarFill = Instance.new("Frame")
LoadBarFill.Size = UDim2.new(0, 0, 1, 0)
LoadBarFill.BackgroundColor3 = Theme.TextPrimary
LoadBarFill.BorderSizePixel = 0
LoadBarFill.ZIndex = 102
LoadBarFill.Parent = LoadBarBG

local MainFrame = Instance.new("CanvasGroup")
MainFrame.Size = UDim2.new(0, 520, 0, 560)
MainFrame.Position = UDim2.new(0.5, -260, 0.5, -280)
MainFrame.BackgroundColor3 = Theme.Background
MainFrame.BorderSizePixel = 0
MainFrame.Visible = false
MainFrame.GroupTransparency = 1
MainFrame.Parent = ScreenGui

Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 8)
local MainStroke = Instance.new("UIStroke")
MainStroke.Thickness = 1
MainStroke.Color = Theme.Border
MainStroke.Parent = MainFrame

local dragging, dragInput, dragStart, startPos
MainFrame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        dragging = true
        dragStart = input.Position
        startPos = MainFrame.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then dragging = false end
        end)
    end
end)
MainFrame.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement then dragInput = input end
end)
UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        local delta = input.Position - dragStart
        PlayTween(MainFrame, {Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)}, 0.15)
    end
end)

local Header = Instance.new("Frame")
Header.Size = UDim2.new(1, 0, 0, 70)
Header.BackgroundTransparency = 1
Header.Parent = MainFrame

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(0, 200, 1, -10)
Title.Position = UDim2.new(0, 30, 0, 10)
Title.BackgroundTransparency = 1
Title.Text = "LANCET"
Title.Font = Enum.Font.GothamBold
Title.TextSize = 22
Title.TextColor3 = Theme.TextPrimary
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

local TabContainer = Instance.new("Frame")
TabContainer.Size = UDim2.new(1, -60, 0, 40)
TabContainer.Position = UDim2.new(0, 30, 0, 70)
TabContainer.BackgroundTransparency = 1
TabContainer.Parent = MainFrame

local TabListLayout = Instance.new("UIListLayout")
TabListLayout.FillDirection = Enum.FillDirection.Horizontal
TabListLayout.Padding = UDim.new(0, 25)
TabListLayout.Parent = TabContainer

local Indicator = Instance.new("Frame")
Indicator.Size = UDim2.new(0, 0, 0, 2)
Indicator.Position = UDim2.new(0, 30, 0, 110)
Indicator.BackgroundColor3 = Theme.TextPrimary
Indicator.BorderSizePixel = 0
Indicator.Parent = MainFrame

local Tabs, TabPages = {}, {}
local ContentContainer = Instance.new("Frame")
ContentContainer.Size = UDim2.new(1, -60, 1, -130)
ContentContainer.Position = UDim2.new(0, 30, 0, 120)
ContentContainer.BackgroundTransparency = 1
ContentContainer.Parent = MainFrame

local function CreateTab(name, isFirst)
    local TabBtn = Instance.new("TextButton")
    TabBtn.Size = UDim2.new(0, 0, 1, 0)
    TabBtn.AutomaticSize = Enum.AutomaticSize.X
    TabBtn.BackgroundTransparency = 1
    TabBtn.Text = name
    TabBtn.TextColor3 = isFirst and Theme.TextPrimary or Theme.TextSecondary
    TabBtn.Font = Enum.Font.GothamMedium
    TabBtn.TextSize = 13
    TabBtn.Parent = TabContainer
    
    local TabPage = Instance.new("ScrollingFrame")
    TabPage.Size = UDim2.new(1, 0, 1, 0)
    TabPage.BackgroundTransparency = 1
    TabPage.ScrollBarThickness = 0
    TabPage.Visible = isFirst
    TabPage.CanvasPosition = isFirst and Vector2.new(0,0) or Vector2.new(0, 50)
    TabPage.Parent = ContentContainer
    
    local PageLayout = Instance.new("UIListLayout")
    PageLayout.Padding = UDim.new(0, 12)
    PageLayout.SortOrder = Enum.SortOrder.LayoutOrder
    PageLayout.Parent = TabPage
    Instance.new("UIPadding", TabPage).PaddingTop = UDim.new(0, 10)

    Tabs[name] = TabBtn
    TabPages[name] = TabPage

    if isFirst then
        task.delay(0.1, function()
            Indicator.Size = UDim2.new(0, TabBtn.AbsoluteSize.X, 0, 2)
            Indicator.Position = UDim2.new(0, TabBtn.AbsolutePosition.X - MainFrame.AbsolutePosition.X, 0, 110)
        end)
    end

    TabBtn.MouseButton1Click:Connect(function()
        PlayTween(Indicator, {
            Size = UDim2.new(0, TabBtn.AbsoluteSize.X, 0, 2),
            Position = UDim2.new(0, TabBtn.AbsolutePosition.X - MainFrame.AbsolutePosition.X, 0, 110)
        }, 0.35, Enum.EasingStyle.Quint)

        for tName, btn in pairs(Tabs) do
            PlayTween(btn, {TextColor3 = Theme.TextSecondary}, 0.3)
            if TabPages[tName].Visible then
                local oldPage = TabPages[tName]
                PlayTween(oldPage, {CanvasPosition = Vector2.new(0, 30)}, 0.2).Completed:Connect(function()
                    oldPage.Visible = false
                end)
            end
        end

        PlayTween(TabBtn, {TextColor3 = Theme.TextPrimary}, 0.3)
        TabPage.Visible = true
        TabPage.CanvasPosition = Vector2.new(0, -30)
        PlayTween(TabPage, {CanvasPosition = Vector2.new(0, 0)}, 0.4)
    end)
    return TabPage
end

local MainTab = CreateTab("Main", true)
local SettingsTab = CreateTab("Settings", false)
local ExtraTab = CreateTab("Webhook", false)

local DashboardCard = Instance.new("Frame")
DashboardCard.Size = UDim2.new(1, 0, 0, 105)
DashboardCard.BackgroundColor3 = Theme.Foreground
DashboardCard.Parent = MainTab
Instance.new("UICorner", DashboardCard).CornerRadius = UDim.new(0, 6)
local CardStroke = Instance.new("UIStroke")
CardStroke.Color = Theme.Border
CardStroke.Parent = DashboardCard

local StatusLabel = Instance.new("TextLabel")
StatusLabel.Size = UDim2.new(1, -40, 0, 20)
StatusLabel.Position = UDim2.new(0, 20, 0, 15)
StatusLabel.BackgroundTransparency = 1
StatusLabel.Text = "Waiting..."
StatusLabel.TextColor3 = Theme.Accent
StatusLabel.Font = Enum.Font.GothamMedium
StatusLabel.TextSize = 12
StatusLabel.TextXAlignment = Enum.TextXAlignment.Left
StatusLabel.Parent = DashboardCard

local StatsLabel = Instance.new("TextLabel")
StatsLabel.Size = UDim2.new(1, -40, 0, 30)
StatsLabel.Position = UDim2.new(0, 20, 0, 35)
StatsLabel.BackgroundTransparency = 1
StatsLabel.Text = "0 Items Collected  •  0 Bought Arrows  •  00:00:00"
StatsLabel.TextColor3 = Theme.TextPrimary
StatsLabel.Font = Enum.Font.GothamMedium
StatsLabel.TextSize = 14
StatsLabel.TextXAlignment = Enum.TextXAlignment.Left
StatsLabel.Parent = DashboardCard

local PerfLabel = Instance.new("TextLabel")
PerfLabel.Size = UDim2.new(1, -40, 0, 20)
PerfLabel.Position = UDim2.new(0, 20, 0, 70)
PerfLabel.BackgroundTransparency = 1
PerfLabel.Text = "Ping: -- ms   |   FPS: --"
PerfLabel.TextColor3 = Theme.TextSecondary
PerfLabel.Font = Enum.Font.Gotham
PerfLabel.TextSize = 11
PerfLabel.TextXAlignment = Enum.TextXAlignment.Left
PerfLabel.Parent = DashboardCard

local function CreateToggle(parent, name, configKey, callback)
    local ToggleFrame = Instance.new("Frame")
    ToggleFrame.Size = UDim2.new(1, 0, 0, 55)
    ToggleFrame.BackgroundColor3 = Theme.Foreground
    ToggleFrame.Parent = parent
    Instance.new("UICorner", ToggleFrame).CornerRadius = UDim.new(0, 6)
    
    local Label = Instance.new("TextLabel")
    Label.Size = UDim2.new(0.7, 0, 1, 0)
    Label.Position = UDim2.new(0, 20, 0, 0)
    Label.BackgroundTransparency = 1
    Label.Text = name
    Label.TextColor3 = Theme.TextPrimary
    Label.Font = Enum.Font.Gotham
    Label.TextSize = 13
    Label.TextXAlignment = Enum.TextXAlignment.Left
    Label.Parent = ToggleFrame

    local SwitchBG = Instance.new("TextButton")
    SwitchBG.Size = UDim2.new(0, 44, 0, 22)
    SwitchBG.Position = UDim2.new(1, -64, 0.5, -11)
    SwitchBG.BackgroundColor3 = Config[configKey] and Theme.TextPrimary or Theme.Border
    SwitchBG.Text = ""
    SwitchBG.AutoButtonColor = false
    SwitchBG.Parent = ToggleFrame
    Instance.new("UICorner", SwitchBG).CornerRadius = UDim.new(1, 0)
    
    local SwitchCircle = Instance.new("Frame")
    SwitchCircle.Size = UDim2.new(0, 16, 0, 16)
    SwitchCircle.Position = Config[configKey] and UDim2.new(1, -19, 0.5, -8) or UDim2.new(0, 3, 0.5, -8)
    SwitchCircle.BackgroundColor3 = Config[configKey] and Theme.Background or Theme.TextPrimary
    SwitchCircle.Parent = SwitchBG
    Instance.new("UICorner", SwitchCircle).CornerRadius = UDim.new(1, 0)

    ToggleFrame.MouseEnter:Connect(function() PlayTween(ToggleFrame, {BackgroundColor3 = Color3.fromRGB(22, 22, 26)}, 0.3) end)
    ToggleFrame.MouseLeave:Connect(function() PlayTween(ToggleFrame, {BackgroundColor3 = Theme.Foreground}, 0.3) end)

    local function ToggleState()
        Config[configKey] = not Config[configKey]
        SaveConfig()
        local state = Config[configKey]
        
        PlayTween(SwitchCircle, {
            Size = UDim2.new(0, 22, 0, 12), 
            Position = state and UDim2.new(1, -25, 0.5, -6) or UDim2.new(0, 3, 0.5, -6),
            BackgroundColor3 = state and Theme.Background or Theme.TextPrimary
        }, 0.15).Completed:Connect(function()
            PlayTween(SwitchCircle, {
                Size = UDim2.new(0, 16, 0, 16), 
                Position = state and UDim2.new(1, -19, 0.5, -8) or UDim2.new(0, 3, 0.5, -8)
            }, 0.25, Enum.EasingStyle.Back)
        end)
        PlayTween(SwitchBG, {BackgroundColor3 = state and Theme.TextPrimary or Theme.Border}, 0.3)
        if callback then callback(state) end
    end

    SwitchBG.MouseButton1Click:Connect(ToggleState)
    ToggleFrame.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then ToggleState() end
    end)
end

local function CreateButton(parent, name, callback)
    local BtnContainer = Instance.new("Frame")
    BtnContainer.Size = UDim2.new(1, 0, 0, 45)
    BtnContainer.BackgroundTransparency = 1
    BtnContainer.Parent = parent

    local Btn = Instance.new("TextButton")
    Btn.Size = UDim2.new(1, 0, 1, 0)
    Btn.Position = UDim2.new(0.5, 0, 0.5, 0)
    Btn.AnchorPoint = Vector2.new(0.5, 0.5)
    Btn.BackgroundColor3 = Theme.Foreground
    Btn.Text = name
    Btn.TextColor3 = Theme.TextPrimary
    Btn.Font = Enum.Font.GothamMedium
    Btn.TextSize = 13
    Btn.AutoButtonColor = false
    Btn.Parent = BtnContainer
    Instance.new("UICorner", Btn).CornerRadius = UDim.new(0, 6)
    
    local BtnStroke = Instance.new("UIStroke")
    BtnStroke.Color = Theme.Border
    BtnStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    BtnStroke.Parent = Btn
    
    Btn.MouseEnter:Connect(function() PlayTween(Btn, {BackgroundColor3 = Color3.fromRGB(24, 24, 28)}, 0.2) end)
    Btn.MouseLeave:Connect(function() PlayTween(Btn, {BackgroundColor3 = Theme.Foreground, Size = UDim2.new(1, 0, 1, 0)}, 0.2) end)
    Btn.MouseButton1Down:Connect(function() PlayTween(Btn, {Size = UDim2.new(0.97, 0, 0.88, 0)}, 0.1) end)
    Btn.MouseButton1Up:Connect(function() PlayTween(Btn, {Size = UDim2.new(1, 0, 1, 0)}, 0.2, Enum.EasingStyle.Back) callback() end)
end

CreateToggle(MainTab, "Enable Auto-Farm", "EnableFarming", function(val) if val then State.LastItemFoundTick = tick() end end)
CreateToggle(MainTab, "Enable Auto-Sell", "EnableSelling", function(val) end)
CreateToggle(MainTab, "Enable Auto-Buy (Lucky Arrows)", "EnableAutoBuy", function(val) end)

CreateToggle(SettingsTab, "Enable ESP", "EnableESP", function(val) 
    if not val then
        for _, esp in pairs(ESPLabels) do if esp then esp:Destroy() end end
        table.clear(ESPLabels)
    end
end)
CreateToggle(SettingsTab, "Enable Streaming Bypass", "EnableStreamingBypass", nil)
CreateToggle(SettingsTab, "Enable Noclip", "EnableNoclip", nil)
CreateToggle(SettingsTab, "Enable Auto Server-Hop", "EnableAutoHop", nil)

CreateButton(SettingsTab, "⚠️ Reset Config (Factory Reset)", function()
    local Defaults = loadstring(game:HttpGet("https://raw.githubusercontent.com/lancet-scripts/Lancet/refs/heads/main/LuckySettings.lua"))()
    
    for k, v in pairs(Defaults) do
        Config[k] = v
    end
    
    Config.Offset = CFrame.new(0, 1.5, 0)
    Config.StartTime = tick()
    
    if writefile then
        pcall(function()
            if isfile and isfile(ConfigFile) and delfile then 
                pcall(delfile, ConfigFile) 
            end
            writefile(ConfigFile, HttpService:JSONEncode(Defaults))
        end)
    end
    
    State.Status = "Config Reset! Reloading UI..."
    task.wait(0.5)
    HopServer()
end)

-- Webhook Tab
local WebhookBox = Instance.new("TextBox")
WebhookBox.Size = UDim2.new(1, 0, 0, 45)
WebhookBox.BackgroundColor3 = Theme.Foreground
WebhookBox.Text = Config.WebhookURL ~= "" and Config.WebhookURL or "Enter Webhook URL Here..."
WebhookBox.TextColor3 = Theme.TextSecondary
WebhookBox.Font = Enum.Font.Gotham
WebhookBox.TextSize = 12
WebhookBox.ClearTextOnFocus = true
WebhookBox.Parent = ExtraTab
Instance.new("UICorner", WebhookBox).CornerRadius = UDim.new(0, 6)
Instance.new("UIStroke", WebhookBox).Color = Theme.Border

WebhookBox.FocusLost:Connect(function()
    Config.WebhookURL = WebhookBox.Text
    SaveConfig()
end)

CreateButton(ExtraTab, "Send Test Message", function()
    if Config.WebhookURL ~= "" and httprequest then
        pcall(function()
            httprequest({
                Url = Config.WebhookURL,
                Method = "POST",
                Headers = {["Content-Type"] = "application/json"},
                Body = HttpService:JSONEncode({content = "✅ **LANCET:** Webhook Connection Successful!"})
            })
        end)
    end
end)

CreateButton(ExtraTab, "Force Server Hop", function()
    State.Status = "Changing Server..."
    HopServer()
end)

CreateButton(ExtraTab, "Rejoin Server", function()
    State.Status = "Rejoining..."
    game:GetService("TeleportService"):Teleport(game.PlaceId)
end)

-- ==========================================
-- 4. FLUID STARTUP SEQUENCE
-- ==========================================
task.spawn(function()
    task.wait(0.5)
    PlayTween(LoadBarFill, {Size = UDim2.new(0.6, 0, 1, 0)}, 1.8)
    task.wait(0.8)
    PlayTween(LoadBarFill, {Size = UDim2.new(1, 0, 1, 0)}, 1.8)
    task.wait(0.5)
    
    PlayTween(LoadingFrame, {BackgroundTransparency = 1}, 0.8)
    PlayTween(LogoText, {TextTransparency = 1}, 0.5)
    PlayTween(LoadBarBG, {BackgroundTransparency = 1}, 0.5)
    PlayTween(LoadBarFill, {BackgroundTransparency = 1}, 0.5)
    
    MainFrame.Visible = true
    MainFrame.Position = UDim2.new(0.5, -260, 0.5, -270)
    PlayTween(MainFrame, {GroupTransparency = 0, Position = UDim2.new(0.5, -260, 0.5, -280)}, 0.8, Enum.EasingStyle.Quint)
    
    task.wait(0.8)
    LoadingFrame:Destroy()
    State.IsLoading = false
end)

-- ==========================================
-- 5. CORE FUNCTIONS & UTILITIES
-- ==========================================
local function FormatTime(seconds)
    local h = math.floor(seconds / 3600)
    local m = math.floor((seconds % 3600) / 60)
    local s = math.floor(seconds % 60)
    return string.format("%02d:%02d:%02d", h, m, s)
end

local fpsCounter = 0
RunService.RenderStepped:Connect(function() fpsCounter = fpsCounter + 1 end)
task.spawn(function()
    while true do
        local ping = "N/A"
        pcall(function() ping = tostring(math.round(Stats.Network.ServerStatsItem["Data Ping"]:GetValue())) end)
        PerfLabel.Text = string.format("Ping: %s ms   |   FPS: %d", ping, fpsCounter)
        fpsCounter = 0
        task.wait(1)
    end
end)

local function UpdateUI()
    if State.IsLoading then return end
    StatusLabel.Text = State.Status
    
    local currentSessionTime = tick() - Config.StartTime
    local totalTimeFarmed = Config.TimeFarmed + currentSessionTime
    
    StatsLabel.Text = string.format("%d Items Collected  •  %d Bought Arrows  •  %s", Config.ItemsCollected, Config.BoughtLuckyArrows, FormatTime(totalTimeFarmed))
end

local function SendWebhook()
    if Config.WebhookURL == "" or not Config.WebhookURL:match("http") or not httprequest then return end
    
    local currentSessionTime = tick() - Config.StartTime
    local totalTimeFarmed = Config.TimeFarmed + currentSessionTime
    
    local data = {
        ["content"] = "",
        ["embeds"] = {{
            ["title"] = "📈 Lancet Farm Update",
            ["description"] = "Farming stats successfully updated.",
            ["color"] = tonumber(0x00FF7F),
            ["fields"] = {
                {["name"] = "Items Collected", ["value"] = tostring(Config.ItemsCollected), ["inline"] = true},
                {["name"] = "Total Runtime", ["value"] = FormatTime(totalTimeFarmed), ["inline"] = true}
            },
            ["footer"] = {["text"] = "Lancet Status Logger"}
        }}
    }
    pcall(function()
        httprequest({
            Url = Config.WebhookURL,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode(data)
        })
    end)
end

local function CleanBlacklist()
    local now = tick()
    for item, expire in pairs(Blacklist) do
        if now > expire then Blacklist[item] = nil end
    end
end

local function CreatePlatform()
    if Platform and Platform.Parent then return end
    Platform = Instance.new("Part")
    Platform.Size = Vector3.new(12, 1.5, 12)
    Platform.Transparency = 1
    Platform.Anchored = true
    Platform.CanCollide = true
    Platform.Name = "LancetSafePlat"
    Platform.Parent = Workspace
end

-- ==========================================
-- 6. ESP SYSTEM
-- ==========================================
local function ClearESP()
    for _, esp in pairs(ESPLabels) do if esp then esp:Destroy() end end
    table.clear(ESPLabels)
end

local function CreateESP(part, name, distance)
    if not part then return end
    
    local box = Instance.new("BoxHandleAdornment")
    box.Size = part.Size + Vector3.new(0.1, 0.1, 0.1)
    box.Color3 = Theme.TextPrimary
    box.Transparency = 0.7
    box.AlwaysOnTop = true
    box.ZIndex = 5
    box.Adornee = part
    box.Parent = part
    table.insert(ESPLabels, box)
    
    local bb = Instance.new("BillboardGui")
    bb.Size = UDim2.new(0, 150, 0, 40)
    bb.AlwaysOnTop = true
    bb.Adornee = part
    
    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.new(1, 0, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Text = string.format("%s\n[%d m]", name, distance)
    lbl.TextColor3 = Theme.TextPrimary
    lbl.Font = Enum.Font.GothamMedium
    lbl.TextSize = 11
    lbl.Parent = bb
    bb.Parent = part
    
    table.insert(ESPLabels, bb)
end

-- ==========================================
-- 7. ITEM DETECTION & LOGIC
-- ==========================================
local function GetValidPart(item)
    if not item then return nil end
    if item:IsA("BasePart") then return item end
    local base = item:FindFirstChildWhichIsA("BasePart")
    if base then return base end
    return item:FindFirstChild("Handle")
end

local function ScanForItems()
    local Spawns = Workspace:FindFirstChild("Item_Spawns")
    if not Spawns then return nil, nil, nil end
    local Items = Spawns:FindFirstChild("Items")
    if not Items then return nil, nil, nil end

    local closestItem, closestPart, closestPrompt = nil, nil, nil
    local shortestDist = math.huge
    local hrp = lp.Character and lp.Character:FindFirstChild("HumanoidRootPart")
    if not hrp then return nil, nil, nil end

    if Config.EnableESP then ClearESP() end

    for _, item in pairs(Items:GetChildren()) do
        if Blacklist[item] then continue end

        local part = GetValidPart(item)
        local prompt = item:FindFirstChildOfClass("ProximityPrompt")

        if part and part.Transparency < 1 and prompt and prompt.Enabled then
            local dist = (hrp.Position - part.Position).Magnitude
            
            if Config.EnableESP then CreateESP(part, item.Name, dist) end

            if dist < shortestDist then
                shortestDist = dist
                closestItem = item
                closestPart = part
                closestPrompt = prompt
            end
        end
    end
    return closestItem, closestPart, closestPrompt
end

local function ExecuteSafeTP(targetPos)
    local char = lp.Character
    if not char then return false end
    local hrp = char:FindFirstChild("HumanoidRootPart")
    local hum = char:FindFirstChildOfClass("Humanoid")
    if not hrp or not hum then return false end

    CreatePlatform()
    
    pcall(function()
        hum:Move(Vector3.new(0,0,0), false)
        hrp.Velocity = Vector3.new(0,0,0)
        hrp.AssemblyLinearVelocity = Vector3.new(0,0,0)
        hrp.AssemblyAngularVelocity = Vector3.new(0,0,0)
    end)

    if camera.CameraType ~= Enum.CameraType.Custom then
        camera.CameraType = Enum.CameraType.Custom
        camera.CameraSubject = hum
    end

    local currentPos = hrp.Position
    local distance = (targetPos - currentPos).Magnitude
    
    if distance > Config.GrabRadius then
        local direction = (targetPos - currentPos).Unit
        local step = math.min(Config.TPStepDistance, distance)
        
        local nextCFrame = CFrame.lookAt(currentPos + (direction * step), targetPos)
        pcall(function()
            hrp.CFrame = nextCFrame
            Platform.CFrame = nextCFrame * CFrame.new(0, -3.5, 0)
        end)
        
        task.wait(Config.TPDelay)
        return false
    end
    return true
end

local function ExecuteSpiralBypass()
    local char = lp.Character
    if not char then return end
    local hrp = char:FindFirstChild("HumanoidRootPart")
    local hum = char:FindFirstChildOfClass("Humanoid")
    if not hrp or not hum then return end

    State.Status = "Bypassing Map Chunks..."
    CreatePlatform()

    local angle = State.CurrentSpiralAngle
    local radius = State.CurrentSpiralRadius
    local targetPosition = Vector3.new(radius * math.cos(math.rad(angle)), Config.YHeight, radius * math.sin(math.rad(angle)))
    
    local bypassCFrame = CFrame.new(targetPosition)
    pcall(function()
        hrp.CFrame = bypassCFrame
        hrp.Velocity = Vector3.new(0,0,0)
        hrp.AssemblyLinearVelocity = Vector3.new(0,0,0)
        hrp.AssemblyAngularVelocity = Vector3.new(0,0,0)
        Platform.CFrame = bypassCFrame * CFrame.new(0, -3.5, 0)
    end)
    
    camera.CameraType = Enum.CameraType.Scriptable
    camera.CFrame = CFrame.new(targetPosition + Vector3.new(0, 100, 0), targetPosition)
    
    task.wait(Config.ChunkLoadWait)
    
    camera.CameraType = Enum.CameraType.Custom
    camera.CameraSubject = hum
    
    State.CurrentSpiralAngle = State.CurrentSpiralAngle + 60
    if State.CurrentSpiralAngle >= 360 then
        State.CurrentSpiralAngle = 0
        State.CurrentSpiralRadius = State.CurrentSpiralRadius + Config.SpiralSpacing
    end
    if State.CurrentSpiralRadius > Config.MaxSpiralRadius then State.CurrentSpiralRadius = 50 end
end

-- ==========================================
-- 8. BACKGROUND TASKS & MAIN LOOPS
-- ==========================================
lp.Idled:Connect(function()
    VirtualUser:CaptureController()
    VirtualUser:ClickButton2(Vector2.new())
end)

local cachedParts = {}
local function cacheCharacterParts(char)
    table.clear(cachedParts)
    if not char then return end
    for _, part in pairs(char:GetDescendants()) do
        if part:IsA("BasePart") then table.insert(cachedParts, part) end
    end
    char.DescendantAdded:Connect(function(part)
        if part:IsA("BasePart") then table.insert(cachedParts, part) end
    end)
end
lp.CharacterAdded:Connect(cacheCharacterParts)
if lp.Character then cacheCharacterParts(lp.Character) end

RunService.Stepped:Connect(function()
    if Config.EnableNoclip and Config.EnableFarming and lp.Character then
        local hum = lp.Character:FindFirstChildOfClass("Humanoid")
        if hum and hum.Health > 0 then
            for _, part in pairs(cachedParts) do
                if part.Parent and part.CanCollide then part.CanCollide = false end
            end
        end
    end
end)

task.spawn(function()
    while true do task.wait(0.5) UpdateUI() end
end)

local hopping = false
task.spawn(function()
    while true do
        task.wait(1)
        if Config.EnableFarming and Config.EnableAutoHop and not hopping then
            if tick() - State.LastItemFoundTick > Config.HopIfNoItemsFor then
                hopping = true
                State.Status = "No items found! Teleporting to another server..."
                task.wait(0.5)
                HopServer()
                task.wait(10)
                hopping = false
            end
        end
    end
end)

task.spawn(function()
    while true do
        task.wait(10)
        if Config.EnableFarming or Config.EnableSelling or Config.EnableAutoBuy then SaveConfig() end
    end
end)

-- Main Farming Loop
task.spawn(function()
    while true do
        task.wait(0.05)
        if State.IsLoading then continue end
        CleanBlacklist()
        
        if not Config.EnableFarming then
            State.Status = "Awaiting..."
            if Platform then pcall(function() Platform.CFrame = CFrame.new(0, 99999, 0) end) end
            task.wait(0.5)
            continue
        end

        local char = lp.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        
        if not hrp or not hum or hum.Health <= 0 then
            State.Status = "Waiting for Character..."
            if Platform then Platform:Destroy() Platform = nil end
            State.Item = nil
            task.wait(2)
            continue
        end

        if State.Item == nil or not State.Item:IsDescendantOf(Workspace) or (State.Part and State.Part.Transparency >= 1) then
            State.Item = nil
            local item, part, prompt = ScanForItems()
            
            if item then
                State.Item = item
                State.Part = part
                State.Prompt = prompt
                State.LockTick = tick()
                State.LastItemFoundTick = tick()
                State.Status = "Item Found! Teleporting..."
                State.CurrentSpiralRadius = 50
            else
                if Config.EnableStreamingBypass then
                    ExecuteSpiralBypass()
                else
                    State.Status = "Scanning for items..."
                    task.wait(0.5)
                end
            end
        else
            if tick() - State.LockTick > Config.BlacklistTime then
                Blacklist[State.Item] = tick() + 30
                State.Item = nil
                State.Status = "Item stuck, blacklisting..."
                continue
            end

            State.Status = "Moving to item..."
            local targetPos = (State.Part.CFrame * Config.Offset).Position
            local hasReached = ExecuteSafeTP(targetPos)
            
            if hasReached then
                pcall(function() 
                    hrp.CFrame = CFrame.new(targetPos)
                    hrp.Velocity = Vector3.new(0,0,0)
                    hrp.AssemblyLinearVelocity = Vector3.new(0,0,0)
                    hrp.AssemblyAngularVelocity = Vector3.new(0,0,0)
                    hrp.Anchored = true 
                end)
                task.wait(0.1) 
                
                if State.Prompt and State.Prompt.Parent then
                    State.Status = "Collecting item..."
                    pcall(function() fireproximityprompt(State.Prompt, 1, true) end)
                    task.wait(0.2)
                end
                
                Config.ItemsCollected = Config.ItemsCollected + 1
                SaveConfig()
                Blacklist[State.Item] = tick() + 3
                State.Item = nil
                
                if Config.ItemsCollected % Config.WebhookLogInterval == 0 then
                    task.spawn(SendWebhook)
                end
                
                State.Status = "Success! Looking for next..."
                
                pcall(function() hrp.Anchored = false end)
                task.wait(Config.PostGrabWait)
            end
        end
    end
end)

-- Auto Selling Loop
task.spawn(function()
    while true do
        task.wait(0.5)
        if State.IsLoading then continue end

        if not Config.EnableSelling then
            continue
        end

        local char = lp.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local hum = char and char:FindFirstChildOfClass("Humanoid")

        if not hrp or not hum or hum.Health <= 0 then
            task.wait(2)
            continue
        end

        local backpack = lp.Backpack
        local Whitelist = {
            ["Lucky Arrow"] = true,
            ["Lucky Stone Mask"] = true,
            ["Requiem Arrow"] = true,
            ["Stand Arrow"] = true,
            ["Umbrella"] = true,
            ["Dio’s Bone"] = true,
            ["Koichi’s Suitcase"] = true,
        }

        for _, tool in pairs(backpack:GetChildren()) do
            local isKeep = Whitelist[tool.Name] or string.find(tool.Name, "Disc")
            if not isKeep and (tool:FindFirstChild("Handle") or tool:FindFirstChild("Hand")) then
                State.Status = "Selling item: " .. tool.Name
                pcall(function() hum:EquipTool(tool) end)
                task.wait(0.3)
                local Remote = char:FindFirstChild("RemoteEvent")
                if Remote then
                    pcall(function()
                        Remote:FireServer("DialogueInteracted", {DialogueName = "Merchant", Speaker = "ShiftPlox, The Travelling Merchant"})
                        task.wait(0.3)
                        Remote:FireServer("EndDialogue", {Option = "Option2", Dialogue = "Dialogue5", NPC = "Merchant"})
                    end)
                    task.wait(0.3)
                end
                
                State.Status = "Item Sold Successfully."
                task.wait(1)
            end
        end
        task.wait(5)
    end
end)

-- Auto Buying Loop 
task.spawn(function()
    while true do
        task.wait(1)
        if State.IsLoading then continue end

        if not Config.EnableAutoBuy then
            continue
        end

        local char = lp.Character
        if not char then continue end
        local hrp = char:FindFirstChild("HumanoidRootPart")
        local hum = char:FindFirstChildOfClass("Humanoid")

        if not hrp or not hum or hum.Health <= 0 then
            task.wait(2)
            continue
        end

        pcall(function()
            local stats = lp:FindFirstChild("PlayerStats")
            if stats and stats:FindFirstChild("Money") and stats.Money.Value >= 75000 then
                State.Status = "Buying Lucky Arrow..."
                local Remote = char:FindFirstChild("RemoteEvent")
                if Remote then
                    Remote:FireServer("PurchaseShopItem", {ItemName = "1x Lucky Arrow"})
                    
                    Config.BoughtLuckyArrows = Config.BoughtLuckyArrows + 1
                    SaveConfig()
                    
                    if Config.WebhookURL ~= "" and Config.WebhookURL:match("http") and httprequest then
                        task.spawn(function()
                            pcall(function()
                                httprequest({
                                    Url = Config.WebhookURL,
                                    Method = "POST",
                                    Headers = {["Content-Type"] = "application/json"},
                                    Body = HttpService:JSONEncode({
                                        embeds = {{
                                            title = "🏹 Lucky Arrow Purchased Successfully!",
                                            description = "Lancet bot has automatically purchased a **Lucky Arrow** from the merchant.",
                                            color = 0xFFD700,
                                            fields = {
                                                {name = "Total Bought", value = tostring(Config.BoughtLuckyArrows), inline = true},
                                                {name = "Remaining Cash", value = tostring(stats.Money.Value - 75000) .. " $", inline = true}
                                            },
                                            footer = {text = "Lancet Auto-Buy Logger"}
                                        }}
                                    })
                                })
                            end)
                        end)
                    end

                    State.Status = "Item Bought!"
                    task.wait(2)
                end
            end
        end)
        task.wait(5)
    end
end)

setfpscap(math.huge)
