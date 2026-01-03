/**
 * Common types for Better Stack Uptime API
 */

export type ApiVersion = "v2" | "v3";

export interface BetterStackCredentials {
	apiToken: string;
}

export interface ApiRequestOptions {
	method: "GET" | "POST" | "PATCH" | "DELETE";
	endpoint: string;
	apiVersion?: ApiVersion;
	body?: Record<string, unknown>;
	qs?: Record<string, string | number | boolean | undefined>;
}

export interface PaginatedResult<T> {
	items: T[];
	hasMore: boolean;
	nextPageUrl: string | null;
}

// Monitor types
export type MonitorType =
	| "status"
	| "expected_status_code"
	| "keyword"
	| "keyword_absence"
	| "ping"
	| "tcp"
	| "udp"
	| "smtp"
	| "pop"
	| "imap"
	| "dns"
	| "playwright";

export type MonitorStatus =
	| "paused"
	| "pending"
	| "maintenance"
	| "up"
	| "validating"
	| "down";

export type HttpMethod = "get" | "head" | "post" | "put" | "patch";

export type Region = "us" | "eu" | "as" | "au";

// Heartbeat types
export type HeartbeatStatus = "paused" | "pending" | "up" | "down";

// Incident types
export type IncidentStatus = "started" | "acknowledged" | "resolved";

// Incident comment attributes
export interface IncidentCommentAttributes {
	id: number;
	content: string;
	user_id?: number;
	user_email?: string;
	created_at: string;
	updated_at: string;
}

// Status page types
export type StatusPageTheme = "light" | "dark" | "system";
export type StatusPageDesign = "v1" | "v2";
export type StatusPageLayout = "vertical" | "horizontal";

// Metadata types
export type MetadataOwnerType =
	| "Monitor"
	| "Heartbeat"
	| "Incident"
	| "WebhookIntegration"
	| "EmailIntegration"
	| "IncomingWebhook"
	| "CallRouting";

// Monitor attributes
export interface MonitorAttributes {
	url: string;
	pronounceable_name: string;
	monitor_type: MonitorType;
	status: MonitorStatus;
	check_frequency: number;
	request_timeout: number;
	recovery_period: number;
	confirmation_period: number;
	http_method: HttpMethod;
	request_headers?: Record<string, string>;
	request_body?: string;
	expected_status_codes?: number[];
	regions: Region[];
	verify_ssl: boolean;
	ssl_expiration?: number;
	domain_expiration?: number;
	port?: number;
	required_keyword?: string;
	call: boolean;
	sms: boolean;
	email: boolean;
	push: boolean;
	critical_alert?: boolean;
	team_wait?: number;
	policy_id?: string;
	follow_redirects?: boolean;
	maintenance_days?: string[];
	maintenance_timezone?: string;
	maintenance_from?: string;
	maintenance_to?: string;
	paused_at?: string;
	paused?: boolean;
	created_at: string;
	updated_at: string;
	monitor_group_id?: string;
}

// Heartbeat attributes
export interface HeartbeatAttributes {
	name: string;
	url: string;
	period: number;
	grace: number;
	status: HeartbeatStatus;
	call: boolean;
	sms: boolean;
	email: boolean;
	push: boolean;
	critical_alert?: boolean;
	team_wait?: number;
	heartbeat_group_id?: string;
	sort_index?: number;
	paused_at?: string;
	maintenance_days?: string[];
	maintenance_from?: string;
	maintenance_to?: string;
	maintenance_timezone?: string;
	created_at: string;
	updated_at: string;
}

// Incident attributes
export interface IncidentAttributes {
	name: string;
	status: IncidentStatus;
	cause?: string;
	incident_group_id?: string;
	started_at: string;
	acknowledged_at?: string;
	acknowledged_by?: string;
	resolved_at?: string;
	resolved_by?: string;
	response_content?: string;
	response_url?: string;
	response_options?: string;
	http_method?: string;
	regions?: Region[];
	screenshot_url?: string;
	origin_url?: string;
	ssl_certificate_expires_at?: string;
	domain_expires_at?: string;
	call: boolean;
	sms: boolean;
	email: boolean;
	push: boolean;
	critical_alert?: boolean;
	escalation_policy_id?: string;
	url?: string;
	metadata?: Record<string, unknown>;
}

// Status page attributes
export interface StatusPageAttributes {
	company_name: string;
	company_url?: string;
	contact_url?: string;
	logo_url?: string;
	subdomain: string;
	custom_domain?: string;
	timezone?: string;
	theme: StatusPageTheme;
	design: StatusPageDesign;
	layout: StatusPageLayout;
	custom_css?: string;
	custom_javascript?: string;
	google_analytics_id?: string;
	announcement?: string;
	announcement_embed_visible?: boolean;
	announcement_embed_css?: string;
	announcement_embed_link?: string;
	navigation_links?: Array<{ text: string; href: string }>;
	password_enabled?: boolean;
	ip_allowlist?: string[];
	hide_from_search_engines?: boolean;
	subscribable?: boolean;
	min_incident_length?: number;
	history?: number;
	aggregate_state?: boolean;
	automatic_reports?: boolean;
	status_page_group_id?: string;
	created_at: string;
	updated_at: string;
}

// Status page resource types
export type StatusPageResourceType =
	| "Monitor"
	| "MonitorGroup"
	| "Heartbeat"
	| "HeartbeatGroup"
	| "WebhookIntegration"
	| "EmailIntegration"
	| "IncomingWebhook"
	| "ResourceGroup"
	| "LogsChart"
	| "CatalogReference";

export type WidgetType = "plain" | "history" | "response_times" | "chart_only";

// Status page resource attributes
export interface StatusPageResourceAttributes {
	status_page_section_id?: number;
	resource_id?: number;
	resource_type?: StatusPageResourceType;
	public_name?: string;
	explanation?: string;
	position?: number;
	fixed_position?: boolean;
	widget_type?: WidgetType;
	history?: boolean;
	availability?: number;
	status?: string;
	status_history?: Array<{
		day: string;
		status: string;
		downtime_duration: number;
		maintenance_duration: number;
	}>;
}

// Escalation policy attributes
export interface EscalationPolicyAttributes {
	name: string;
	repeat_count?: number;
	repeat_delay?: number;
	incident_token?: string;
	steps?: EscalationStep[];
	created_at: string;
	updated_at: string;
}

export interface EscalationStep {
	type: string;
	wait_before?: number;
	urgency_id?: number;
	step_members?: StepMember[];
}

export interface StepMember {
	type: string;
	id?: string;
}

// Monitor/Heartbeat group attributes
export interface GroupAttributes {
	name: string;
	sort_index?: number;
	paused?: boolean;
	created_at: string;
	updated_at: string;
}
