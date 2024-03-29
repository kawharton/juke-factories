app.controller('albumCtrl', function($scope, $rootScope, $log, $http){
	
	$http.get('/api/albums')
	.then(response => response.data)
	.then(albums => {
		return $http.get('/api/albums/' + albums[3]._id);
	})
	.then(response => response.data)
	.then(album => {
		$scope.album = album;
		album.imageUrl = '/api/albums/' + album._id + '.image';
		$scope.random = false;	
	})
	.catch($log.error)
	//using arrow functions instead of the below

	// .then(function(response) {
	// 	return $http.get('/api/albums/' + response.data[3]._id);
	// })
	// .then(function(response){
	// 	$scope.album = response.data;
	// 	response.data.imageUrl = '/api/albums/' + $scope.album._id + '.image';
	// 	$scope.random = false;
	// 	// console.log('the server responded with', response.data)
	// })
	// .catch($log.error)
	// alternate -- .catch(console.error.bind(console));
	
	$scope.joinArtists = function (arrOfArtists){
		var artists = arrOfArtists.map(function(el){
			return el.name;
		})
		return artists.join(", ")
	}
	$scope.toggle = function() {
		//send currentSong
		$scope.currentSong.audio = document.createElement('audio');
		var url = "/api/songs/"+$scope.currentSong._id+".audio";
		$scope.songs = $scope.random ? $scope.songArray : $scope.album.songs;
		// console.log('toggle', $scope.songs, 'random', $scope.random)
		$scope.songs.forEach(function(s, i) {
			if (s == $scope.currentSong){
				s.hidden = true;
				s.audio.src = url;
				s.audio.load();
				s.audio.play();

			s.audio.addEventListener('timeupdate', function () {
			    $scope.progress = 100 * s.audio.currentTime / s.audio.duration;
			    $rootScope.$broadcast('progressUpdate', $scope.progress);
			});
				$scope.currentSong.index = i;
			} else {
				s.hidden = false;
				if(s.audio) s.audio.pause();
			}
		})
	} 

	$rootScope.$on('currentTimeUpdate', function(event, progressTime) {
		$scope.currentSong.audio.currentTime = progressTime * $scope.currentSong.audio.duration / 100;
	})

	$scope.playSong = function(songId, song){
		$scope.currentSong = song;
		$scope.toggle();
		$rootScope.$broadcast('songPlay');
	};

	$rootScope.$on('pause', function(event){
		$scope.currentSong.audio.pause();
	})

	$rootScope.$on('play', function(event){
		$scope.currentSong.audio.play();

		$scope.currentSong.audio.addEventListener('timeupdate', function () {
			$scope.progress = 100 * $scope.currentSong.audio.currentTime / $scope.currentSong.audio.duration;
			$rootScope.$broadcast('progressUpdate', $scope.progress);
		});
	})

	$rootScope.$on('next', function (event){
		$scope.songs = $scope.random ? $scope.songArray : $scope.album.songs;
		var currentIndex = $scope.currentSong.index;
		if (currentIndex === $scope.songs.length-1) {
			$scope.currentSong = $scope.songs[0];
		}
		else $scope.currentSong = $scope.songs[currentIndex+1]
		$scope.toggle();
	});

	$rootScope.$on('prev', function (event){
		$scope.songs = $scope.random ? $scope.songArray : $scope.album.songs;
		var currentIndex = $scope.currentSong.index;
		if (!currentIndex) $scope.currentSong = $scope.songs[$scope.songs.length-1];
		else $scope.currentSong = $scope.songs[currentIndex-1]
		$scope.toggle();
	});

	$rootScope.$on('random', function (event){
		// console.log('in', $scope.album.songs);
		$scope.random = !$scope.random;
		$scope.songArray = [];
		$scope.album.songs.forEach(function(el) {
			$scope.songArray.push(el);
		})

		var max = $scope.songArray.length - 1
		for (var i = max; i >= 0; i--) {
		    var j = Math.floor(Math.random() * (i + 1));
			var temp = $scope.songArray[i];
			$scope.songArray[i] = $scope.songArray[j];
			$scope.songArray[j] = temp;
		}
	});
})
