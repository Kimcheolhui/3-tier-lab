```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: container-image-registry-pv-<your_namespace>
  labels:
    volume: container-image-registry-pv-<your_namespace>
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data/<your_namespace>/registry
    type: DirectoryOrCreate
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values:
                - <your_namespace>
```

```shell
kubectl get pv
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: container-image-registry-pvc
  namespace: <your_namespace>
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: manual
  selector:
    matchLabels:
      volume: container-image-registry-pv-<your_namespace>
  resources:
    requests:
      storage: 5Gi
```

```shell
kubectl get pvc -n <your_namespace>
```

```yaml
# registry.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: container-image-registry
  namespace: <your_namespace>
spec:
  replicas: 1
  selector:
    matchLabels:
      app: container-image-registry
  template:
    metadata:
      labels:
        app: container-image-registry
    spec:
      containers:
        - name: registry
          image: registry:2
          ports:
            - containerPort: 5000
          volumeMounts:
            - name: registry-storage
              mountPath: /var/lib/registry
      volumes:
        - name: registry-storage
          persistentVolumeClaim:
            claimName: image-registry-pvc-<your_namespace>
```

```shell
kubectl get deploy -n <your_namespace>
```

```yaml
# registry-service-<your_namespace>.yaml
apiVersion: v1
kind: Service
metadata:
  name: container-image-registry
  namespace: <your_namespace>
spec:
  selector:
    app: container-image-registry
  ports:
    port: 80
      targetPort: 5000
  type: ClusterIP
```

```shell
kubectl get service -n <your_namespace>
```

```shell
sudo vim /etc/docker/daemon.json
```
