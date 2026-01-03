import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from "n8n-workflow";

export class BetterStackApi implements ICredentialType {
	name = "betterStackApi";
	displayName = "Better Stack API";
	documentationUrl =
		"https://betterstack.com/docs/uptime/api/getting-started-with-uptime-api/";
	icon: Icon = "file:../icons/betterstack.svg";

	properties: INodeProperties[] = [
		{
			displayName: "API Token",
			name: "apiToken",
			type: "string",
			typeOptions: { password: true },
			default: "",
			required: true,
			description:
				"Better Stack API token. Get it from Better Stack Settings -> API tokens. Use either a Global API Token or an Uptime API Token.",
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: "generic",
		properties: {
			headers: {
				Authorization: "=Bearer {{$credentials.apiToken}}",
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: "https://uptime.betterstack.com/api/v2",
			url: "/monitors",
			method: "GET",
		},
	};
}
