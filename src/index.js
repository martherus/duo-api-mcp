#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var zod_1 = require("zod");
var axios_1 = require("axios");
var fs_1 = require("fs");
var path = require("path");
// MCP Server instance
var server = new mcp_js_1.McpServer({
    name: "postman-collection-mcp-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Global variables to store collections and environments
var loadedCollections = new Map();
var environments = new Map();
// Helper function to resolve variables in strings
function resolveVariables(text, collectionVars, envVars) {
    return text.replace(/\{\{([^}]+)\}\}/g, function (match, varName) {
        return envVars.get(varName) || collectionVars.get(varName) || match;
    });
}
// Helper function to parse URL
function parseUrl(url) {
    if (typeof url === 'string') {
        return url;
    }
    return url.raw;
}
// Helper function to build headers
function buildHeaders(headers, auth) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    if (headers === void 0) { headers = []; }
    var headerMap = {};
    // Add regular headers
    headers.forEach(function (header) {
        if (!header.disabled) {
            headerMap[header.key] = header.value;
        }
    });
    // Add auth headers
    if (auth) {
        switch (auth.type) {
            case 'bearer':
                var bearerToken = (_b = (_a = auth.bearer) === null || _a === void 0 ? void 0 : _a.find(function (item) { return item.key === 'token'; })) === null || _b === void 0 ? void 0 : _b.value;
                if (bearerToken) {
                    headerMap['Authorization'] = "Bearer ".concat(bearerToken);
                }
                break;
            case 'basic':
                var username = ((_d = (_c = auth.basic) === null || _c === void 0 ? void 0 : _c.find(function (item) { return item.key === 'username'; })) === null || _d === void 0 ? void 0 : _d.value) || '';
                var password = ((_f = (_e = auth.basic) === null || _e === void 0 ? void 0 : _e.find(function (item) { return item.key === 'password'; })) === null || _f === void 0 ? void 0 : _f.value) || '';
                var credentials = Buffer.from("".concat(username, ":").concat(password)).toString('base64');
                headerMap['Authorization'] = "Basic ".concat(credentials);
                break;
            case 'apikey':
                var key = (_h = (_g = auth.apikey) === null || _g === void 0 ? void 0 : _g.find(function (item) { return item.key === 'key'; })) === null || _h === void 0 ? void 0 : _h.value;
                var value = (_k = (_j = auth.apikey) === null || _j === void 0 ? void 0 : _j.find(function (item) { return item.key === 'value'; })) === null || _k === void 0 ? void 0 : _k.value;
                var inHeader = ((_m = (_l = auth.apikey) === null || _l === void 0 ? void 0 : _l.find(function (item) { return item.key === 'in'; })) === null || _m === void 0 ? void 0 : _m.value) === 'header';
                if (key && value && inHeader) {
                    headerMap[key] = value;
                }
                break;
        }
    }
    return headerMap;
}
// Register MCP tools
server.tool("load-postman-collection", "Load a Postman collection from a JSON file", {
    filePath: zod_1.z.string().describe("Path to the Postman collection JSON file"),
    collectionName: zod_1.z.string().optional().describe("Optional name to reference this collection")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fullPath, fileContent, collection, name_1, collectionVars_1, error_1;
    var _c;
    var filePath = _b.filePath, collectionName = _b.collectionName;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                fullPath = path.resolve(filePath);
                return [4 /*yield*/, fs_1.promises.readFile(fullPath, 'utf-8')];
            case 1:
                fileContent = _d.sent();
                collection = JSON.parse(fileContent);
                name_1 = collectionName || collection.info.name || path.basename(filePath, '.json');
                loadedCollections.set(name_1, collection);
                collectionVars_1 = new Map();
                (_c = collection.variable) === null || _c === void 0 ? void 0 : _c.forEach(function (variable) {
                    collectionVars_1.set(variable.key, variable.value);
                });
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Successfully loaded Postman collection: ".concat(name_1, "\nCollection contains ").concat(collection.item.length, " requests\nAvailable requests:\n").concat(collection.item.map(function (item, index) { return "".concat(index + 1, ". ").concat(item.name, " (").concat(item.request.method, ")"); }).join('\n'))
                            }
                        ]
                    }];
            case 2:
                error_1 = _d.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error loading collection: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error')
                            }
                        ]
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
server.tool("list-collections", "List all loaded Postman collections", {}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var collections;
    return __generator(this, function (_a) {
        collections = Array.from(loadedCollections.entries()).map(function (_a) {
            var name = _a[0], collection = _a[1];
            return "\u2022 ".concat(name, ": ").concat(collection.info.description || 'No description', " (").concat(collection.item.length, " requests)");
        });
        return [2 /*return*/, {
                content: [
                    {
                        type: "text",
                        text: collections.length > 0
                            ? "Loaded collections:\n".concat(collections.join('\n'))
                            : "No collections loaded. Use load-postman-collection tool first."
                    }
                ]
            }];
    });
}); });
server.tool("list-requests", "List all requests in a loaded collection", {
    collectionName: zod_1.z.string().describe("Name of the collection to list requests from")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var collection, requests;
    var collectionName = _b.collectionName;
    return __generator(this, function (_c) {
        collection = loadedCollections.get(collectionName);
        if (!collection) {
            return [2 /*return*/, {
                    content: [
                        {
                            type: "text",
                            text: "Collection '".concat(collectionName, "' not found. Available collections: ").concat(Array.from(loadedCollections.keys()).join(', '))
                        }
                    ]
                }];
        }
        requests = collection.item.map(function (item, index) {
            var url = parseUrl(item.request.url);
            return "".concat(index + 1, ". ").concat(item.name, "\n   Method: ").concat(item.request.method, "\n   URL: ").concat(url, "\n   Description: ").concat(item.request.description || 'No description');
        });
        return [2 /*return*/, {
                content: [
                    {
                        type: "text",
                        text: "Requests in collection '".concat(collectionName, "':\n\n").concat(requests.join('\n\n'))
                    }
                ]
            }];
    });
}); });
server.tool("execute-request", "Execute a specific request from a loaded collection", {
    collectionName: zod_1.z.string().describe("Name of the collection"),
    requestName: zod_1.z.string().describe("Name of the request to execute"),
    environment: zod_1.z.string().optional().describe("Optional environment name to use for variable substitution"),
    overrideVars: zod_1.z.record(zod_1.z.string()).optional().describe("Optional variables to override for this execution")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var collection, request, collectionVars_2, envVars_1, rawUrl, resolvedUrl, headers, resolvedHeaders_1, axiosConfig, formData_1, urlEncodedData_1, startTime, response, endTime, responseText, error_2, errorText;
    var _c, _d, _e, _f, _g, _h;
    var collectionName = _b.collectionName, requestName = _b.requestName, environment = _b.environment, _j = _b.overrideVars, overrideVars = _j === void 0 ? {} : _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 2, , 3]);
                collection = loadedCollections.get(collectionName);
                if (!collection) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Collection '".concat(collectionName, "' not found.")
                                }
                            ]
                        }];
                }
                request = collection.item.find(function (item) { return item.name === requestName; });
                if (!request) {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Request '".concat(requestName, "' not found in collection '").concat(collectionName, "'.")
                                }
                            ]
                        }];
                }
                collectionVars_2 = new Map();
                (_c = collection.variable) === null || _c === void 0 ? void 0 : _c.forEach(function (variable) {
                    collectionVars_2.set(variable.key, variable.value);
                });
                envVars_1 = environment ? (environments.get(environment) || new Map()) : new Map();
                // Add override variables
                Object.entries(overrideVars).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    envVars_1.set(key, value);
                });
                rawUrl = parseUrl(request.request.url);
                resolvedUrl = resolveVariables(rawUrl, collectionVars_2, envVars_1);
                headers = buildHeaders(request.request.header, request.request.auth || collection.auth);
                resolvedHeaders_1 = {};
                Object.entries(headers).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    resolvedHeaders_1[key] = resolveVariables(value, collectionVars_2, envVars_1);
                });
                axiosConfig = {
                    method: request.request.method.toLowerCase(),
                    url: resolvedUrl,
                    headers: resolvedHeaders_1,
                    timeout: 30000,
                };
                // Add body if present
                if (request.request.body) {
                    switch (request.request.body.mode) {
                        case 'raw':
                            axiosConfig.data = resolveVariables(request.request.body.raw || '', collectionVars_2, envVars_1);
                            break;
                        case 'formdata':
                            formData_1 = new FormData();
                            (_d = request.request.body.formdata) === null || _d === void 0 ? void 0 : _d.forEach(function (item) {
                                formData_1.append(item.key, resolveVariables(item.value, collectionVars_2, envVars_1));
                            });
                            axiosConfig.data = formData_1;
                            break;
                        case 'urlencoded':
                            urlEncodedData_1 = new URLSearchParams();
                            (_e = request.request.body.urlencoded) === null || _e === void 0 ? void 0 : _e.forEach(function (item) {
                                urlEncodedData_1.append(item.key, resolveVariables(item.value, collectionVars_2, envVars_1));
                            });
                            axiosConfig.data = urlEncodedData_1;
                            break;
                    }
                }
                startTime = Date.now();
                return [4 /*yield*/, (0, axios_1.default)(axiosConfig)];
            case 1:
                response = _k.sent();
                endTime = Date.now();
                responseText = "Request executed successfully!\n\n\uD83D\uDCDD Request Details:\n   Method: ".concat(request.request.method, "\n   URL: ").concat(resolvedUrl, "\n   Headers: ").concat(JSON.stringify(resolvedHeaders_1, null, 2), "\n\n\u26A1 Response:\n   Status: ").concat(response.status, " ").concat(response.statusText, "\n   Time: ").concat(endTime - startTime, "ms\n   Headers: ").concat(JSON.stringify(response.headers, null, 2), "\n   \n\uD83D\uDCC4 Response Body:\n").concat(typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data);
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: responseText
                            }
                        ]
                    }];
            case 2:
                error_2 = _k.sent();
                if (axios_1.default.isAxiosError(error_2)) {
                    errorText = "Request failed!\n\n\u274C Error Details:\n   Status: ".concat((_f = error_2.response) === null || _f === void 0 ? void 0 : _f.status, " ").concat((_g = error_2.response) === null || _g === void 0 ? void 0 : _g.statusText, "\n   Message: ").concat(error_2.message, "\n   \n\uD83D\uDCC4 Error Response:\n").concat(((_h = error_2.response) === null || _h === void 0 ? void 0 : _h.data) ? (typeof error_2.response.data === 'object' ? JSON.stringify(error_2.response.data, null, 2) : error_2.response.data) : 'No response body');
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: errorText
                                }
                            ]
                        }];
                }
                else {
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: "text",
                                    text: "Error executing request: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error')
                                }
                            ]
                        }];
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
server.tool("load-environment", "Load environment variables from a JSON file", {
    filePath: zod_1.z.string().describe("Path to the environment JSON file"),
    environmentName: zod_1.z.string().describe("Name to reference this environment")
}, function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var fullPath, fileContent, envData, envVars_2, error_3;
    var filePath = _b.filePath, environmentName = _b.environmentName;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                fullPath = path.resolve(filePath);
                return [4 /*yield*/, fs_1.promises.readFile(fullPath, 'utf-8')];
            case 1:
                fileContent = _c.sent();
                envData = JSON.parse(fileContent);
                envVars_2 = new Map();
                // Handle Postman environment format
                if (envData.values) {
                    envData.values.forEach(function (item) {
                        envVars_2.set(item.key, item.value);
                    });
                }
                else {
                    // Handle simple key-value format
                    Object.entries(envData).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        envVars_2.set(key, String(value));
                    });
                }
                environments.set(environmentName, envVars_2);
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Successfully loaded environment '".concat(environmentName, "' with ").concat(envVars_2.size, " variables:\n").concat(Array.from(envVars_2.keys()).map(function (key) { return "\u2022 ".concat(key); }).join('\n'))
                            }
                        ]
                    }];
            case 2:
                error_3 = _c.sent();
                return [2 /*return*/, {
                        content: [
                            {
                                type: "text",
                                text: "Error loading environment: ".concat(error_3 instanceof Error ? error_3.message : 'Unknown error')
                            }
                        ]
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); });
server.tool("list-environments", "List all loaded environments", {}, function () { return __awaiter(void 0, void 0, void 0, function () {
    var envList;
    return __generator(this, function (_a) {
        envList = Array.from(environments.entries()).map(function (_a) {
            var name = _a[0], vars = _a[1];
            return "\u2022 ".concat(name, ": ").concat(vars.size, " variables");
        });
        return [2 /*return*/, {
                content: [
                    {
                        type: "text",
                        text: envList.length > 0
                            ? "Loaded environments:\n".concat(envList.join('\n'))
                            : "No environments loaded. Use load-environment tool first."
                    }
                ]
            }];
    });
}); });
// Main function to run the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Postman Collection MCP Server running on stdio");
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
