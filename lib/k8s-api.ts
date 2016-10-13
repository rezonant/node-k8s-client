
export interface List<T> {
	kind : 'List';
	apiVersion : string;
	metadata : Metadata;
	items : T[];
}

export interface SecretReference {
	secretName : string;
}

export interface PodVolume {
	name : string;
	emptyDir? : any;
	secret? : SecretReference
}

export interface PodContainerPort {
	containerPort : number;
	protocol : "TCP" | "UDP";
}

export interface PodEnvironmentVariable {
	name : string;
	value : string;
}

export interface PodVolumeMount {
	name : string;
	mountPath : string;
	readOnly? : boolean;
}

export interface PodContainer {
	name : string;
	image : string;
	command : string[];
	ports : PodContainerPort[];
	env : PodEnvironmentVariable[];
	resources : any;
	volumeMounts: PodVolumeMount[];
	terminationMessagePath : string;
	imagePullPolicy : "Always" | "Never";
}

export interface PodSpec {
	volumes : PodVolume[];
	containers : PodContainer[];
}

export interface PodStatusCondition {
	type : string;
	status : string;
	lastProbeTime : string;
	lastTransitionTime : string;
}

export interface PodContainerStatusState {
	// TODO
}

export interface PodContainerStatus {
	name : string;
	state : PodContainerStatusState;
	lastState: PodContainerStatusState;
	ready : boolean;
	restartCount : number;
	image : string;
	imageID : string;
	containerID : string;
}

export interface PodStatus {
	phase : "Running";
	conditions: PodStatusCondition[];
	hostIP : string;
	podIP : string;
	startTime : string;
	containerStatuses: PodContainerStatus[];
}

export interface Pod {
	kind : "Pod";
	apiVersion : string;
	metadata : Metadata;
	spec : PodSpec;
	status : PodStatus;
}

export interface ReplicatedPodSpec extends PodSpec {
	restartPolicy : "Always" | "Never";
	terminationGracePeriodSeconds : number;
	dnsPolicy : "ClusterFirst";
}

export interface ReplicatedPod extends Pod {
	spec : ReplicatedPodSpec;
}

export interface ReplicationControllerSpec {
	replicas : number;
	selector : any;
	template : ReplicatedPod;
}

export interface ReplicationControllerStatus {
	replicas : number;
	observedGeneration : number;
}

export interface ReplicationController {
	kind : "ReplicationController";
	apiVersion : string;
	metadata : Metadata;
	spec : ReplicationControllerSpec;
	status : ReplicationControllerStatus;
}

export interface ServicePort {
	protocol : string;
	port : number;
	targetPort : number;
}

export interface ServiceSpec {
	ports : ServicePort[];
	selector : any;
	clusterIP : string;
	type : string;
	sessionAffinity : string;
}

export interface ServiceStatus {
	loadBalancer? : any;
}

export interface Service {
	kind : "Service";
	apiVersion : string;
	metadata : Metadata;
	spec: ServiceSpec;
	status : ServiceStatus;
}

export interface NamespaceSpec {
	finalizers: string[];
}

export interface NamespaceStatus {
	phase : "Active";
}

export interface Namespace {
	kind : "Namespace";
	apiVersion : string;
	metadata : Metadata;
	spec : NamespaceSpec;
	status : NamespaceStatus;
}

export interface Metadata {
	name : string;
	selfLink : string;
	uid : string;
	resourceVersion : string;
	creationTimestamp : string;
	labels? : any;
	annotations? : any; 
}

export interface NodeSpec {
	externalID : string;
	providerID : string;
}

export interface NodeCapacity {
	cpu : number;
	memory : string;
	pods : number;
}

export interface NodeStatusCondition {
	type : string;
	status : string;
	lastHeartbeatTime : string;
	lastTransitionTime : string;
	reason : string;
	message : string;
}

export interface NodeAddress {
	type : string;
	address : string;
}

export interface DaemonEndpoint {
	Port : number;
}

export interface NodeInfo {
	machineID : string;
	systemUUID : string;
	bootID : string;
	kernelVersion : string;
	osImage : string;
	containerRuntimeVersion : string;
	kubeletVersion : string;
	kubeProxyVersion : string;
}

export interface NodeStatus {
	capacity : NodeCapacity;
	conditions : NodeStatusCondition[];
	addresses : NodeAddress[];
	daemonEndpoints : Map<string, DaemonEndpoint>;
	nodeInfo : NodeInfo;
}

export interface Node {
	kind : "Node";
	apiVersion : string;
	metadata : Metadata;
	spec : NodeSpec;
	status : NodeStatus;
}

export interface DaemonSet {

}

export interface RollingUpdateStrategyOptions {
	maxUnavailable : number;
	maxSurge : number;
}

export interface DeploymentStrategy {
	type : "RollingUpdate";
	rollingUpdate? : RollingUpdateStrategyOptions;
}

export interface DeploymentSpec {
	replicas : number;
	selector : any;
	template : ReplicatedPod;
	strategy : DeploymentStrategy;
}

export interface DeploymentStatus {
	observedGeneration : number;
	replicas : number;
	updatedReplicas : number;
	availableReplicas : number;
}

export interface Deployment {
	kind : "Deployment";
	apiVersion : string;
	metadata : Metadata;
	spec : DeploymentSpec;
	status : DeploymentStatus;
}

export interface Secret {
	kind : "Secret";
	apiVersion : string;
	metadata : Metadata;
	data: any;
	type: string;
}

export interface EndpointsAddress {
	ip : string;
}

export interface EndpointsPort {
	name : string;
	port : number;
	protocol : "TCP" | "UDP";
}

export interface EndpointsSubset {
	addresses : EndpointsAddress[];
	ports : EndpointsPort[];
}

export interface Endpoint {
	kind : "Endpoints";
	apiVersion : string;
	metadata : Metadata;
	subsets : EndpointsSubset[];
}

export interface IngressBackend {
	serviceName : string;
	servicePort : number | string;
}

export interface IngressPath {
	path? : string;
	backend : IngressBackend;
}

export interface HttpIngressRule {
	paths : IngressPath[];
}

export interface IngressRule {
	host? : string;
	http : HttpIngressRule;
}

export interface IngressTLS {
	secretName : string;
}

export interface IngressSpec {
	backend? : IngressBackend;
	rules? : IngressRule[]; 
	tls? : IngressTLS[];
}

export interface IngressLoadBalancer {
	ip : string;
}

export interface IngressLoadBalancerStatus {
	ingress : IngressLoadBalancer[];
}

export interface IngressStatus {
	loadBalancer : IngressLoadBalancerStatus;
}

export interface Ingress {
	kind : "Ingress";
	apiVersion : string;
	metadata : Metadata;
	spec : IngressSpec;
	status : IngressStatus;
}