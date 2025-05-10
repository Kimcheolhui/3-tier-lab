# 3-Tier Lab - Week 1

# 0. Objective

이번 실습에서는 쿠버네티스(Kubernetes) 환경에서 **3 Tier Architecture**를 기반으로 한 웹 서비스 백엔드를 배포하는 과정을 다룹니다.
전체 실습은 2주간 진행되며, 그 중 1주차 실습은 다음의 요소를 중점으로 다룹니다.

- PostgreSQL Database를 쿠버네티스 위에 배포
- NestJS 기반 Backend를 쿠버네티스 위에 배포하고, 데이터베이스와 연결
- Nginx와 React 어쩌고 저쩌고 (영호님 작성 부탁드립니다!)

> [!note]
>
> 이번 Lab은 <b>Lab#5 (Cluster Lab)</b>에서 구성한 Kubernetes Cluster 위에서 진행되며, 클러스터는 다음과 같은 구성입니다.
>
> ![Kubernets Installation](img/nuc-prep.png)
>
> 각 실습자는 각자의 PC에서 <b>NUC1(master node)</b>에 원격 접속(SSH)하여 Kubernetes namespace를 생성하고, namespace로 분리된 환경에서 실습을 진행합니다.

# 1. Concept

## 1-1. 3-Tier Architecture

**3-Tier Architecture**란, 하나의 애플리케이션을 기능별로 세 개의 계층으로 분리(물리적/논리적)하여 구성하는 아키테쳐 설계 방식입니다.

이는 특히 웹 서비스과 같이 사용자와 상호작용하고, 데이터를 처리하며, 이를 저장해야 하는 시스템에서 널리 사용됩니다.

### 구성 요소

![3-Tier Architecture](img/3-Tier-Arch.png)

1. Presentation Tier (프론트엔드)
   - 사용자와 직접 상호작용하는 계층입니다.
   - 브라우저에서 실행되는 React, Vue, Angular 등의 웹 프레임워크/라이브러리가 대표적입니다.
   - 모바일 앱도 이 계층에 해당되며 네이티브로는 안드로이드, SwiftUI, 크로스플랫폼으로 Flutter나 React Native가 대표적입니다.
2. Application Tier (백엔드)
   - Application Tier로부터 발생한 사용자의 요청을 처리하고, 비즈니스 로직을 수행하며, 데이터베이스와 통신합니다.
   - 보통 Express, NestJS, Django, Spring 등으로 개발된 서버 애플리케이션이 위치합니다.
   - Buisiness Logic Tier, Transaction Tier라고도 불립니다.
3. Data Tier (데이터베이스)
   - 데이터베이스와 데이터베이스에 접근하여 데이터를 읽거나 쓰는 것을 관리하는 계층입니다.
   - 애플리케이션의 데이터를 영구적으로 저장합니다.
   - PostgreSQL, MySQL, MongoDB 등 다양한 Database가 사용됩니다.

### 등장 배경

과거의 웹 애플리케이션은 하나의 서버에서 모든 역할(사용자 인터페이스, 로직 처리, 데이터 저장)을 수행하는 **모놀리식(Monolithic) 구조**로 구성되는 경우가 많았습니다.

그러나 다음과 같은 문제들이 점차 뚜렷해지며, 3-Tier Architecture가 대두되었습니다.

- 기능이 복잡해질수록 프로젝트와 코드의 규모가 거대해지고 유지보수가 어려워짐
- 사용자 수 증가에 따른 서버의 부하 집중
- 특정 기능 하나의 변경이 전체 서비스에 영향을 주는 구조적 한계
- 서비스 확장 시 전체를 스케일링해야 하므로 비효율적

이러한 문제를 해결하기 위해 각 계층을 분리하고, 계층이나 기능별로 독립 배포 및 관리가 가능하도록 하는 구조가 필요해졌고, 그것이 바로 3-Tier Architecture입니다.

### 기존 구조와의 차이점

| 항목           | Monolithic Architecture | 3-Tier Architecture        |
| -------------- | ----------------------- | -------------------------- |
| 코드 분리      | X (기능이 섞여 있음)    | O (기능별 계층 분리)       |
| 유지보수       | 오류 원인 파악이 어려움 | 계층 단위로 관리 가능      |
| 스케일링       | 전체 확장이 필요        | 계층 단위로 독립 확장 가능 |
| 장애 영향 범위 | 전체 서비스로 전파 가능 | 단일 계층에서 격리 가능    |
| 배포 전략      | 단일 배포               | 계층별 독립 배포 가능      |

### 이점

- **독립성**: 프론트엔드, 백엔드, DB를 서로 독립적으로 개발하고 배포 가능
- **유지보수성**: 문제 발생 시 어느 계층의 문제인지 명확하게 식별 가능
- **확장성**: 부하가 많은 계층만 별도로 확장 가능 (예: DB는 그대로 두고 BE만 scale-out)
- **보안성**: DB는 외부와 직접 연결되지 않으며, Backend를 통해서만 접근 가능

### 단점

- **운영 복잡도 증가**: 계층이 나뉘면서 통신 및 배포 구조가 복잡해짐
- **네트워크 비용 증가**: 계층 간 트래픽이 발생하므로 대규모 시스템에서는 성능 고려 필요
- **개발 난이도 상승**: 계층 간 API 설계, 데이터 포맷 설계 등 인터페이스 관리가 필요

### 3-Tier Architecture를 Kubernetes 환경에서 운영하는 이유

3-Tier 구조를 쿠버네티스 환경에서 운영할 경우 **현대적인 클라우드 네이티브** 관점에서 많은 이점을 얻을 수 있으며, 다음은 그 일부에 대한 설명입니다.

1. **배포 자동화**

   - 각 계층을 별도 Deployment로 관리하여 독립적으로 롤링 업데이트 가능

2. **자가 복구(Self-healing)**

   - 특정 계층의 일부 Pod가 비정상적으로 종료되면 자동으로 복구됨

3. **수평 확장(Horizontal Scaling)**

   - 특정 계층의 부하가 증가하면 자동으로 수평 확장하여 부하 분산 가능

4. **관측 및 로깅 통합**

   - Prometheus, Grafana 등을 활용한 계층 통합 모니터링

5. **인프라 독립성**

   - 클라우드, 온프레미스 어디서든 동일한 배포 방식 사용 가능

6. **네임스페이스 기반 격리 환경**
   - 계층별/서비스별로 namespace를 분리하여 실습과 실서비스 운영이 가능

결론적으로, 3-Tier Architecture 구조는 쿠버네티스와 궁합이 매우 잘 맞으며, 현대 서비스 개발 및 운영에 있어 기본이 되는 설계 방식입니다.

## 1-2. 왜 기업들이 Kubernetes 환경에서 서비스를 운영하는가?

<b>Lab#5 (Cluster Lab)</b>에서도 여러 번 언급했지만, 많은 기업들이 Kubernetes 기반의 인프라로 전환하는 이유는 다음과 같습니다.

### 1. **서비스 가용성 극대화**

- Pod이 실패하면 자동 복구되고, 헬스체크(Health Probe)에 실패하면 자동으로 재시작됨
- 장애가 발생해도 전체 서비스가 다운되지 않고, 부분 복구 가능

### 2. **운영 자동화**

- `Deployment`, `StatefulSet` 등의 리소스를 사용해 무중단 배포(Rolling Update), 롤백(Rollback) 등 자동화된 배포 전략 사용
- CI/CD 파이프라인과 쉽게 통합 가능

### 3. **유지보수 편의성**

- YAML 기반 선언적 설정으로 인프라 변경사항을 추적, 관리 가능
- Helm, Kustomize 등 템플릿 도구로 복잡한 설정도 단순화 가능

### 4. **확장성 (Scalability)**

- 특정 서비스가 트래픽이 몰릴 경우, `Deployment`의 `replica` 수만 조정해서 손쉽게 확장 가능
- HPA (Horizontal Pod Autoscaler)와 연계하면 자동으로 확장 가능

### 5. **리소스 효율성**

- Node 단위가 아닌 Pod 단위로 스케줄링되므로, 클러스터 리소스를 효율적으로 사용
- CPU, Memory 제한 설정으로 과도한 자원 소비 방지

### 6. **환경 간 일관성 보장**

- 개발, 테스트, 운영 환경을 동일한 설정(YAML)으로 유지 가능
- 개발자가 만든 설정이 그대로 프로덕션에 반영될 수 있음

### 7. **클라우드/온프레미스 모두 지원**

- AWS, GCP, Azure 같은 퍼블릭 클라우드는 물론, 자체 서버 환경(On-prem)에서도 동일한 방식으로 운용 가능
- 벤더 종속 없이 멀티 클라우드 전략 가능

이러한 이유로 대규모 기업뿐 아니라, 스타트업, 교육기관, 정부기관 등도 점점 Kubernetes 기반 인프라로 전환하고 있으며, 현대 인프라/DevOps 환경에서 사실상 표준으로 자리잡고 있습니다.

# 2. Lab Preparation

이제 본격적으로 3-Tier Lab을 시작해봅시다.

## 2-1. Master Node에 원격 접속하기 (For NUC2, NUC3)

우선 NUC2와 NUC3에서 실습할 경우, 터미널에 아래 명령어를 입력해 Master Node에 원격 접속합니다.

```bash
ssh <username>@nuc01
# 컴시이실 실습자의 경우 username은 gist
```

Kubernetes Cluster의 Master node에 접속했으면, 다음의 명령어를 입력하여 Kubernetes Cluster의 node와 pod 상태를 확인하여 Kubernetes Cluster가 정상적으로 작동 중인지 확인합니다.

```bash
# Kubernetes Cluster에 속한 노드의 상태
kubectl get nodes

# Kubernetes Cluster에 띄워진 모든 namespace의 Pod들의 상태
kubectl get pods -A
```

모든 Nodes가 `Ready` 상태이며 모든 Pods가 `Running` 상태임을 확인했을 것입니다.

> [!warning]
>
> `Ready` 상태가 아닌 Node나 `Running` 상태가 아닌 Pod가 있다면 추후 실습이 정상적으로 진행되지 않을 수 있습니다.

## 2-2. Kubernetes Namespace 생성하기 (For all NUCs)

이번 실습은 모든 실습자가 각자의 NUC에서 Kubernetes Master Node에 원격 접속하여 진행되는 만큼, Kubernetes의 자원을 여러 사용자에게 논리적으로 나누는 `namespace`를 활용합니다.

> [!note]
>
> **Namespace란?**
>
> 쿠버네티스 클러스터 내에서 논리적으로 리소스를 격리할 수 있는 기능입니다. 하나의 클러스터에서 여러 사용자나 팀이 동시에 작업하더라도 각자의 작업이 서로 영향을 주지 않도록 분리된 공간을 제공합니다.
>
> 실습에서는 실습자마다 **자신만의 namespace**를 만들고, **그 안에서만 리소스를 생성/관리**하게 됩니다. 이렇게 하면 **충돌 없이 여러 명이 동시에 실습**할 수 있습니다.

다음의 명령어를 입력하여 본인의 `namespace`를 생성해주세요!

```bash
# 현재 네임스페이스 목록 확인
kubectl get namespace

# <your_namespace>에는 각자 작업 중인 PC에 따라 nuc01, nuc02, 또는 nuc03을 입력하세요
kubectl create namesapce <your_namespace>

# 생성된 본인의 namespace 확인
kubectl get namespace
```

## 2-3. Kubernetes Basic Manuals 연습

이 섹션에서는 Kubernetes 클러스터를 다루는 데 필요한 기본적인 명령어들을 직접 실습하며 익힙니다. 실습 중 배포할 리소스들은 대부분 `kubectl`을 통해 조작하게 됩니다. 아래 명령어는 자주 사용되는 명령어들이며, 이후 실습의 기본이 됩니다.

### (1) 리소스 조회: `kubectl get <resource>`

Kubernetes에서 현재 상태를 확인할 때 가장 많이 사용하는 명령어입니다.

```bash
kubectl get pods          # 현재 namespace의 Pod 목록 조회
kubectl get services      # 현재 namespace의 Service 목록 조회
kubectl get deployments   # 현재 namespace의 Deployment 목록 조회
kubectl get namespaces    # 클러스터 내 네임스페이스 목록 조회
kubectl get nodes         # 클러스터 내 노드 목록 조회
```

> [!tip]
>
> 아래와 같이 **약어** 사용 가능
>
> `pods` -> `po`
>
> `services` -> `svc`
>
> `deployments` -> `deploy`
>
> `namespaces` -> `ns`

### (2) 네임스페이스 지정 옵션: `-n <namespace>`와 `-A`

- `-n <namespace>`: 특정 네임스페이스 내 리소스만 조회
- `-A` 또는 `--all-namespaces`: 클러스터 내 모든 네임스페이스에서 리소스를 조회

```bash
# 네임스페이스 nuc01에 존재하는 모든 Pod 목록 조회
kubectl get po -n nuc01

# 모든 네임스페이스에 존재하는 모든 Service 목록 조회
kubectl get svc -A
```

### (3) 추가 정보 출력: `-o wide`

`kubectl get` 명령어에 `-o wide` 옵션을 추가하면 IP, 노드 위치 등의 추가 정보를 함께 볼 수 있습니다.

```bash
# 각 Pod가 어떤 node에 띄워졌고, 어떤 Cluster IP를 가지는지 표시된다
kubectl get pods -o wide
```

### (4) 리소스 생성/적용/삭제: `create`, `apply`, `delete`

- `create`: 존재하지 않는 새 리소스를 만드는 데 사용합니다. 초기 리소스 생성에 적합하며, 기존 리소스에 대해서는 작동하지 않습니다.
- `apply`: 기존 리소스의 설정을 수정하거나 추가할 때 유용합니다. 이미 생성된 리소스에 대해서 변경 사항을 적용할 때 사용하며, 새로운 리소스를 생성할 때도 사용할 수 있습니다.
- `delete`: 기존 리소스를 삭제할 때 사용합니다.

```bash
# 아래는 예시입니다.
kubectl apply -f deployment.yaml # 배포 파일을 적용(존재하지 않는 리소스일 경우 생성)
kubectl delete -f deployment.yaml # 해당 리소스를 삭제
```

이러한 명령어들은 이후 실습의 모든 단계에서 반복적으로 사용됩니다. 완벽하게 외우진 못하더라도 익숙해지는 것이 중요합니다.

## 2-4.YAML 파일이란?

쿠버네티스에서 리소스들은 모두 **"선언형(Declarative)"** 방식으로 관리되며, 그 핵심은 **YAML 파일**입니다.

### YAML이란?

`YAML(YAML Ain't Markup Language)`은 사람이 읽기 쉬운 **데이터 직렬화 형식**으로, 들여쓰기를 기반으로 구조화된 정보를 표현할 수 있습니다. 쿠버네티스에서는 각종 리소스(Deployment, Pod, Service 등)를 정의하는 데 사용됩니다.

### 기본 구조 예시

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: my-container
      image: nginx
```

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: my-backend:v1
```

위처럼 작성된 YAML은 `kubectl apply -f <file>.yaml` 명령어로 클러스터에 적용할 수 있습니다.

#### 주요 필드 설명

- apiVersion: 리소스를 정의할 때 사용하는 Kubernetes API 버전
- kind: 리소스 정류 (Pod, Service, Deployment, Secret 등)
- metadata: 이름, 네임스페이스, 라벨 등의 metadata
- spec: 실제 리소스의 세부 동작을 정의하는 핵심 필드

### 실습에서 주의할 점

- 들여쓰기는 공백 2칸 또는 4칸 기준으로 통일
- `:` 뒤에 반드시 공백이 필요함
- 잘못 작성된 YAML 파일은 `kubectl apply` 시 오류를 발생시킴

**YAML 파일을 제대로 이해하고 다룰 줄 아는 것이 Kubernetes 실습의 핵심 중 하나입니다.**

> 실습에서 사용하는 모든 `.yaml` 파일은 Git Repository에 포함되어 있으며, 이를 수정하거나 새로운 파일로 작성하게 됩니다.

## 2-5. Cloning the git Repository

### 2-5-1. 디렉토리 생성하고 Git Clone하기

우선 본인이 사용하는 PC에 맞게 아래 명령어를 입력하여 실습 디렉토리(폴더)를 생성해주세요.

```bash
cd ~
mkdir <your_directory> # nuc01, nuc02, or nuc03
cd <your_directory>
```

이번 Lab은 `Frontend`와 `Backend`에 대한 **코드 템플릿**과, 각각을 **Kubernetes Cluster**에 배포하기 위한 `yaml` 템플릿도 준비되어 있습니다.

이를 위해 본인의 실습 디렉토리 아래 명령어를 입력하여 Github Repository에 준비된 실습 템플릿을 cloning해주세요!

```bash
git clone <추후 github repository url link 추가하기>
cd <repository name>
ls # 실습 템플릿 확인
```

### 2-5-2. Directory Architecture

(추후, 최신 상황에 맞게 업데이트 필요.)

```bash
.
├── backend
│   ├── dist
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma
│   ├── README.md
│   ├── src
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── README.md
│   ├── src
│   └── vite.config.js
├── kubernetes
│   ├── backend
│   └── database
└── README.md
```

# 3. Database & Backend Deployment on Kubernetes

## 3-1. Database Deployment on Kubernetes

### 3-1-1. Persistent Voluem 생성

#### Persisten Volume이란?

> **PersistentVolume(PV)**: 쿠버네티스 클러스터의 노드에 존재하는 실제 스토리지를 나타냅니다. Pod가 사라져도 데이터는 남아있을 수 있도록, 외부 스토리지(예: 디스크)에 대한 연결 정보를 정의합니다.
>
> **PersistentVolumeClaim(PVC)**: 사용자가 특정 스토리지를 사용하겠다고 요청하는 자원입니다. Pod는 PVC를 참조하여 간접적으로 PV를 사용하게 됩니다.

즉, PV는 실제 스토리지, PVC는 사용자의 요청이며, 이 둘을 연결하여 Pod가 안전하게 외부 저장소를 사용하는 구조입니다.

**우선, 미리 정의된 Persistent Volume template file을 각자 사용하는 namespace에 맞게 수정합니다.**

```bash
cd ~/<your_directory\>/3-tier-lab/kubernetes/database
vim postgres-pv.yaml
```

```yaml
# postgres-pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv-<your_namespace>
  labels:
    volume: postgres-pv-<your_namespace>
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  hostPath:
    path: /mnt/data/postgres
  persistentVolumeReclaimPolicy: Retain
```

```bash
# PostgreSQL DB를 위한 Persistent Volume 배포
kubectl apply -f postgres-pv.yaml

# postgres-pv-<your_namespace> 형태로 생성된 Persisten Volume 확인
# 다른 실습자의 PV도 함께 보일 수 있습니다.
kubectl get pv
```

### 3-1-2. PostgreSQL Database 생성

이번에는 PostgreSQL Database를 배포해보겠습니다.

```bash
vim postgres.yaml
```

`postgres.yaml` 파일은 3개의 자원을 정의합니다.

1. **Secret**: database의 user, password 등을 설정하기 위해 사용합니다.
2. **Service**: PostgreSQL을 서비스로 노출시키기 위해 사용합니다.
3. **Statefulset**: 실제 PostgreSQL를 유지하는 역할을 합니다.

> [!note]
>
> **Secret**: 외부에 노출되어선 안 되는 민감한 정보(예: 비밀번호, API 키)를 저장하기 위한 리소스입니다. 여기서는 PostgreSQL의 사용자 이름과 비밀번호를 안전하게 저장하여 다른 리소스에서 참조할 수 있도록 합니다.
>
> **StatefulSet**: 상태를 가지는 어플리케이션(예: DB) 배포를 위한 리소스입니다. 일반 Deployment와 달리, 고정된 이름과 스토리지 볼륨을 보장하며, 각 인스턴스가 고유한 ID를 가지고 안정적인 스토리지 연결이 필요한 상황에 적합합니다.

```yaml
# postgres.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: <your_namespace> # You need to replace this with your own namespace
type: Opaque
stringData:
  POSTGRES_USER: myuser
  POSTGRES_PASSWORD: mypassword # Don't use this kind of password in real life. It's just for study.
  POSTGRES_DB: mydb
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
  type: ClusterIP
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          envFrom:
            - secretRef:
                name: postgres-secret
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        selector:
          matchLabels:
            volume: postgres-pv-<your_namespace>
        resources:
          requests:
            storage: 5Gi
```

이제 다음의 명령어를 입력하여 PostgreSQL Database를 배포해주세요.

```bash
kubectl apply -f postgres.yaml

# 생성된 Secret 확인
kubectl get secret -n <your_namespace>

# 생성된 Service 확인
kubectl get svc -n <your_namespace>

# 생성된 Statefulset 확인
kubectl get statefulset -n <your_namespace>
```

이제 `3-Tier Architecture`를 구성하는 `Data Tier`인 **PostgreSQL Database**를 Kubernetes Cluster에 배포하는 작업을 마무리했습니다.

## 3-2. Backend Deployment on Kubernetes

지금부터는 `3-Tier Architecture`에서 `Application Tier`에 해당하는 **Backend Service**를 Kubernetes Cluster에 배포해보도록 하겠습니다.

### 3-2-1. Database Access를 위한 Secret 생성

방금 생성한 PostgreSQL Database에 Backend Service가 접근하기 위해서는 DB 접속 정보가 필요합니다.

DB 접속 정보에는 Database에 접근하기 위한 **URL**과 인증을 위한 **Password**가 필요하며, Backend Service가 이 정보를 사용할 수 있도록 Kubernetes의 Secret 자원을 생성합니다.

```bash
cd ~/3-tier-lab/kubernetes/backend
vim secret.yaml
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: <your_namespace> # You need to replace this with your own namespace
type: Opaque
stringData:
  DATABASE_URL: "postgresql://myuser:mypassword@postgres.<your_namespace>.svc.cluster.local:5432/mydb" # You need to replace this with your own namespace
  PASSWORD_SECRET: <your_password_secret> # You need to replace this with your own secret like random string
```

다음의 명령어를 입력하여 PostgreSQL DB에 접속할 수 있는 DB 접속 정보 Secret을 생성해주세요.

```bash
kubectl apply -f secret.yaml
kubectl get secret -n <your_namespace>
```

## 3-2-2. Backend Deployment 생성

DB에 접근하기 위한 Secret 자원 생성을 마쳤다면, 이제 Backend Service를 배포할 차례입니다.

Backend 서비스는 이미 빌드된 Docker Container Image를 사용합니다.

```bash
vim deployment.yaml
```

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      containers:
        - name: api
          image: cjfgml0306/backend:latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: backend-secret
          resources: # 다음과 같이 Container가 사용할 수 있는 리소스의 크기를 제한할 수 있습니다.
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

```bash
kubectl apply -f deployment.yaml
kubectl get deploy -n <your_namespace>
```

## 3-2-3. Backend Service 생성

`Deployment`를 생성했으면 이와 연결될 `Service`도 함께 생성해주도록 합니다.

```bash
vim service.yaml
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: <your_namespace> # You need to replace this with your own namespace
spec:
  selector:
    app: backend-api # deployment.yaml의 spec.selector.matchLabels.app와 일치
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

```bash
kubectl apply -f service.yaml
kubectl get svc -n <your_namespace>
```

지금까지 3-Tier Architecture의 Data Tier와 Application Tier에 대한 배포를 마쳤습니다.

# 4. Frondend Deployment on Kubernetes

(4랑 5는 영호님이 작성해주시면 될 것 같아요!)

# 5. 배포된 웹 서비스 확인

# 6. Lab Review
