const mapService = require('./mapService');

// 路径优化服务
class RouteService {
  constructor() {
    this.mapService = mapService;
  }

  // 生成距离矩阵
  async generateDistanceMatrix(origin, destinations) {
    try {
      const matrix = [];
      
      // 计算起点到所有目的地的距离
      const originToDestinations = await this.mapService.distance([origin], destinations);
      
      if (!originToDestinations) {
        return null;
      }
      
      // 计算所有目的地之间的距离
      const destinationsToDestinations = await this.mapService.distance(destinations, destinations);
      
      if (!destinationsToDestinations) {
        return null;
      }
      
      // 构建距离矩阵
      matrix.push(originToDestinations.map(item => item.distance));
      
      for (let i = 0; i < destinations.length; i++) {
        const row = [];
        for (let j = 0; j < destinations.length; j++) {
          const item = destinationsToDestinations.find(d => 
            d.origin.latitude === destinations[i].latitude && 
            d.origin.longitude === destinations[i].longitude &&
            d.destination.latitude === destinations[j].latitude && 
            d.destination.longitude === destinations[j].longitude
          );
          row.push(item ? item.distance : 0);
        }
        matrix.push(row);
      }
      
      return matrix;
    } catch (error) {
      console.error('生成距离矩阵失败:', error);
      return null;
    }
  }

  // 最近邻贪心算法（小规模场景）
  greedyAlgorithm(origin, destinations, distanceMatrix) {
    const n = destinations.length;
    const visited = new Array(n).fill(false);
    const path = [0]; // 0表示起点
    let current = 0;
    let totalDistance = 0;

    for (let i = 0; i < n; i++) {
      let minDistance = Infinity;
      let next = -1;

      for (let j = 1; j <= n; j++) {
        if (!visited[j - 1] && distanceMatrix[current][j] < minDistance) {
          minDistance = distanceMatrix[current][j];
          next = j;
        }
      }

      if (next === -1) {
        break;
      }

      path.push(next);
      visited[next - 1] = true;
      totalDistance += minDistance;
      current = next;
    }

    // 返回起点
    totalDistance += distanceMatrix[current][0];
    path.push(0);

    // 转换为实际地址顺序
    const result = path.map(index => {
      if (index === 0) {
        return origin;
      } else {
        return destinations[index - 1];
      }
    });

    return {
      path: result,
      totalDistance
    };
  }

  // 遗传算法（中规模场景）
  geneticAlgorithm(origin, destinations, distanceMatrix, iterations = 100, populationSize = 200) {
    const n = destinations.length;
    
    // 生成初始种群
    const generatePopulation = () => {
      const population = [];
      for (let i = 0; i < populationSize; i++) {
        const individual = Array.from({ length: n }, (_, index) => index + 1);
        // 随机打乱
        for (let j = n - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [individual[j], individual[k]] = [individual[k], individual[j]];
        }
        population.push(individual);
      }
      return population;
    };

    // 计算适应度
    const calculateFitness = (individual) => {
      let distance = distanceMatrix[0][individual[0]];
      for (let i = 0; i < n - 1; i++) {
        distance += distanceMatrix[individual[i]][individual[i + 1]];
      }
      distance += distanceMatrix[individual[n - 1]][0];
      return 1 / distance; // 适应度与距离成反比
    };

    // 选择
    const selection = (population) => {
      population.sort((a, b) => calculateFitness(b) - calculateFitness(a));
      return population.slice(0, populationSize / 2);
    };

    // 交叉
    const crossover = (parent1, parent2) => {
      const start = Math.floor(Math.random() * n);
      const end = Math.floor(Math.random() * (n - start)) + start;
      const child = new Array(n).fill(-1);
      
      // 复制父1的基因片段
      for (let i = start; i <= end; i++) {
        child[i] = parent1[i];
      }
      
      // 填充父2的基因
      let j = 0;
      for (let i = 0; i < n; i++) {
        if (child[i] === -1) {
          while (child.includes(parent2[j])) {
            j++;
          }
          child[i] = parent2[j];
          j++;
        }
      }
      
      return child;
    };

    // 变异
    const mutate = (individual, mutationRate = 0.1) => {
      if (Math.random() < mutationRate) {
        const i = Math.floor(Math.random() * n);
        const j = Math.floor(Math.random() * n);
        [individual[i], individual[j]] = [individual[j], individual[i]];
      }
      return individual;
    };

    // 执行遗传算法
    let population = generatePopulation();
    let bestIndividual = null;
    let bestFitness = 0;

    for (let i = 0; i < iterations; i++) {
      // 选择
      const selected = selection(population);
      
      // 交叉和变异
      const newPopulation = [];
      while (newPopulation.length < populationSize) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        const child = crossover(parent1, parent2);
        const mutatedChild = mutate(child);
        newPopulation.push(mutatedChild);
      }
      
      population = newPopulation;
      
      // 找到当前最优解
      for (const individual of population) {
        const fitness = calculateFitness(individual);
        if (fitness > bestFitness) {
          bestFitness = fitness;
          bestIndividual = individual;
        }
      }
    }

    // 转换为实际地址顺序
    const path = [0, ...bestIndividual, 0];
    const result = path.map(index => {
      if (index === 0) {
        return origin;
      } else {
        return destinations[index - 1];
      }
    });

    // 计算总距离
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDistance += distanceMatrix[path[i]][path[i + 1]];
    }

    return {
      path: result,
      totalDistance
    };
  }

  // 聚类 + 分区调度算法（大规模场景）
  async clusterAlgorithm(origin, destinations, distanceMatrix) {
    try {
      const n = destinations.length;
      const clusterSize = 50; // 每个聚类的最大大小
      const clusters = [];

      // K-means聚类
      const k = Math.ceil(n / clusterSize);
      let centroids = [];
      
      // 初始化聚类中心
      for (let i = 0; i < k; i++) {
        const index = Math.floor(Math.random() * n);
        centroids.push(destinations[index]);
      }

      // 迭代聚类
      for (let iter = 0; iter < 10; iter++) {
        // 重置聚类
        const newClusters = Array.from({ length: k }, () => []);
        
        // 分配点到最近的聚类中心
        for (let i = 0; i < n; i++) {
          let minDistance = Infinity;
          let closestCluster = 0;
          
          for (let j = 0; j < k; j++) {
            const distance = Math.sqrt(
              Math.pow(destinations[i].latitude - centroids[j].latitude, 2) +
              Math.pow(destinations[i].longitude - centroids[j].longitude, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestCluster = j;
            }
          }
          
          newClusters[closestCluster].push(i);
        }
        
        // 更新聚类中心
        for (let j = 0; j < k; j++) {
          if (newClusters[j].length > 0) {
            let sumLat = 0;
            let sumLng = 0;
            for (const index of newClusters[j]) {
              sumLat += destinations[index].latitude;
              sumLng += destinations[index].longitude;
            }
            centroids[j] = {
              latitude: sumLat / newClusters[j].length,
              longitude: sumLng / newClusters[j].length
            };
          }
        }
        
        clusters.length = 0;
        clusters.push(...newClusters);
      }

      // 对每个聚类计算最优路径
      const clusterPaths = [];
      for (const cluster of clusters) {
        if (cluster.length > 0) {
          const clusterDestinations = cluster.map(index => destinations[index]);
          const clusterMatrix = [];
          
          // 构建聚类的距离矩阵
          clusterMatrix.push(cluster.map(index => distanceMatrix[0][index + 1]));
          for (let i = 0; i < cluster.length; i++) {
            const row = [];
            for (let j = 0; j < cluster.length; j++) {
              row.push(distanceMatrix[cluster[i] + 1][cluster[j] + 1]);
            }
            clusterMatrix.push(row);
          }
          
          // 使用贪心算法计算路径
          const result = this.greedyAlgorithm(origin, clusterDestinations, clusterMatrix);
          clusterPaths.push(result);
        }
      }

      // 计算聚类中心之间的距离，确定聚类顺序
      const clusterDistances = [];
      for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].length > 0) {
          const distance = Math.sqrt(
            Math.pow(centroids[i].latitude - origin.latitude, 2) +
            Math.pow(centroids[i].longitude - origin.longitude, 2)
          );
          clusterDistances.push({ index: i, distance });
        }
      }
      
      // 按距离排序
      clusterDistances.sort((a, b) => a.distance - b.distance);
      
      // 合并路径
      const finalPath = [origin];
      let totalDistance = 0;
      
      for (const item of clusterDistances) {
        const clusterPath = clusterPaths[item.index].path;
        // 移除起点，添加到最终路径
        finalPath.push(...clusterPath.slice(1, -1));
        totalDistance += clusterPaths[item.index].totalDistance;
      }
      
      // 添加终点（起点）
      finalPath.push(origin);
      
      return {
        path: finalPath,
        totalDistance
      };
    } catch (error) {
      console.error('聚类算法失败:', error);
      return null;
    }
  }

  // 智能路径排序
  async optimizeRoute(origin, destinations, options = {}) {
    try {
      // 生成距离矩阵
      const distanceMatrix = await this.generateDistanceMatrix(origin, destinations);
      
      if (!distanceMatrix) {
        return {
          success: false,
          message: '生成距离矩阵失败',
          data: null
        };
      }

      let result;
      const n = destinations.length;

      // 根据地址数量选择算法
      if (n <= 50) {
        // 小规模：贪心算法
        result = this.greedyAlgorithm(origin, destinations, distanceMatrix);
      } else if (n <= 200) {
        // 中规模：遗传算法
        result = this.geneticAlgorithm(origin, destinations, distanceMatrix);
      } else {
        // 大规模：聚类算法
        result = await this.clusterAlgorithm(origin, destinations, distanceMatrix);
      }

      if (!result) {
        return {
          success: false,
          message: '路径优化失败',
          data: null
        };
      }

      // 计算预估时间（假设平均速度为40km/h）
      const averageSpeed = 40 * 1000 / 60; // 米/分钟
      const estimatedTime = Math.round(result.totalDistance / averageSpeed);

      return {
        success: true,
        message: '路径优化成功',
        data: {
          path: result.path,
          totalDistance: result.totalDistance,
          estimatedTime: estimatedTime,
          steps: result.path.map((point, index) => {
            if (index === 0) {
              return {
                type: 'origin',
                location: point,
                distance: 0,
                duration: 0
              };
            } else {
              const prevPoint = result.path[index - 1];
              const distance = Math.sqrt(
                Math.pow(point.latitude - prevPoint.latitude, 2) +
                Math.pow(point.longitude - prevPoint.longitude, 2)
              ) * 111000; // 转换为米
              const duration = Math.round(distance / averageSpeed);
              return {
                type: index === result.path.length - 1 ? 'destination' : 'waypoint',
                location: point,
                distance: Math.round(distance),
                duration: duration
              };
            }
          })
        }
      };
    } catch (error) {
      console.error('路径优化失败:', error);
      return {
        success: false,
        message: '路径优化失败',
        data: null
      };
    }
  }
}

module.exports = new RouteService();