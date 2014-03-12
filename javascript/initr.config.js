// Open up your IIFE to protect our global namespace.
( function( $, app, window ) {

	// Initialize some variables to be used later.
	var rootPath, deps;

	// Set your app to be in dev mode or not. (Optional)
	// When you are in dev mode, initr will `console.log` everything it does.
	initr.isDev = true;

	// Set a timeout for your script fetches. (Optional)
	initr.timeout = 12000;

	// Set the path to your scripts.
	rootPath = '/javascript/';

	// This `deps` variable will hold all of our modules and plugins.
	// There are various types of dependencies (as we will call them) that Initr can handle.
	// Our defined types are `$.fn`, `$` and `app`. You can also run anonymous modules to
	// run arbitrary/small bits of code.
	deps = [
		// No-js removel
		{
			selector : 'html',
			init : function( $els, dep ) {
				$els.removeClass('no-js');
			}
		},

		// Smooth Scroll
	    {
			type : '$.fn',
			handle : 'smoothScroll',
			src : 'vendor/jquery.smooth-scroll.min.js',
			selector : '[href^="#"]',
			defaults: {
				offset: -200
			}
		},

		// Form Validation
		{
			selector : 'form',
			deps: ['vendor/jquery.bvalidator.js'],
			init : function( $els, dep ) {
				$els.each(function () {
					$(this).bValidator({
						offset : {
		                    x : 0,
		                   	y : -10
		               	},
		               	template : '<div class="{errMsgClass}"><span class="ss-icon">&#x26A0;</span>{message}</div>',
		               	showCloseIcon : true,
		                position : {
		                    x : 'left',
		                    y : 'bottom'
		                }
		            });
				});
			}
		},

		// Form Handler
		{
			selector : '[data-plugin="form-handler"]',
			init : function( $els, dep ) {
				$els.on('submit', function(e) {
					var $this = $(this),
						data = $this.data('bValidator');

					e.preventDefault();

					if ( data && data.isValid() ) {
						$this.html('<p>Sorry, just showing off a form, but try the email just to the right. :D</p>');
					}
				});
			}
		},

		// Placeholder Fix
        {
            type : '$.fn',
            handle : 'placeholder',
            src : 'vendor/jquery.placeholder.js',
            selector : 'input, textarea'
        },

        // Class Toggle

		/*
			Activate: 		data-plugin="toggle-class"
			Parameters: 	data-target="[CLASS or ID selector/next/prev/parent]" / data-toggle="[CLASS or ID selector/next/prev/parent/parents {CLASS or ID selector}/child {CLASS or ID selector}]"
							data-class="[CLASS NAME]"
							data-type="mobile"

			Toggle class on target element.

			Setting the type to mobile will restrict the slide from working on widths larger then 767px other then iPads.
		*/
		{
			selector : '[data-plugin*="toggle-class"]',
			init : function( $els, dep ) {

				$els.on('click', function(e) {
			        e.preventDefault();

			        var $this = $(this),
			        	$target = findTarget($this, 'toggle');

			        if ($this.data('type') === "mobile") {
			        	if ($(window).width() > 767) {
			        		if (!$('body').hasClass('ipad')) {
			        			return;
			        		}
			        	}

			        }

			        $target.toggleClass($this.data('class'));

			    });
			}
		},

		// Equal Height

		/*
			Activate: 		data-plugin="equal-height"
			Parameters: 	data-group="[GROUP NAME]"
							data-live="[BOOLEAN]"

			Equal height will match the height of all items in a group to the largest height of items in that group.

			If a group is not supplied the element will be assigned to the 'Default' group.

			Adding data-live="true" will activate the responsive check for height changes. If one item is set to live in the group the entire group will be treated as live.
		*/
		{
			selector : '[data-plugin*="equal-height"]',
			init : function( $els, dep ) {

				var height = {
					'default': {
						height: 0,
						lastHeight: 0,
						live: false,
						elems: []
					}
				},
					hasLive = false;

				function equalHeight ($elems, live) {
					$els.each(function () {
						var $this = $(this);

						if ($this.data('group') === undefined) {
							$this.data('group', 'default');
						}

						$this.css('height', '');

						if ( height[$this.data('group')] === undefined ) {
							height[$this.data('group')] =  {
								height: $this.height(),
								lastHeight: $this.height(),
								live: $this.data('live'),
								elems: []
							}
						}

						if ($this.data('live') === true) {
							height[$this.data('group')].live = $this.data('live');

							if(hasLive === false) {
								hasLive = true;
							}
						}

						if ( $this.height() > height[$this.data('group')].height ) {
							height[$this.data('group')].height = $this.height();
						}

						if (height[$this.data('group')].elems.indexOf(this) === -1) {
							height[$this.data('group')].elems.push(this);
						}
					});

					$els.each(function () {
						var $this = $(this);

						$this.height( height[$this.data('group')].height );
					});
				}

				equalHeight($els, false);

				if (hasLive) {
					var timer;

					$(window).on('resize', function () {
						clearTimeout(timer);

						timer = setTimeout(function () {
							$.each(height, function () {
								if(this.live) {
									this.lastHeight = this.height;
									this.height = 0;
									equalHeight($(this.elems), true);
								}
							});
				        }, 50);

					});
				}

			}
		},

		{
			selector : 'body',
			init : function( $els, dep ) {
				var timer = null,
					$layers = $('.bg-body .layer'),
					maxCount = $layers.length - 1,
					$window = $(window);

				$window.on('scroll', function () {
					clearTimeout(timer);

					if($window.width() < 769) {
						return;
					}

					timer = setTimeout(function () {
						var count = 0,
							offsets = [],
							scrollTop = $window.scrollTop() + 200;

						$('section').each(function() {
							offsets.push( $(this).offset().top );
						});

						$.each( offsets, function(key, value) {
							if( scrollTop > value ) {
								count++;
							}
						});

						if( scrollTop < 300 ) {
							count = 0;
						}

						if( count > maxCount ) {
							count = maxCount;
						}

						$layers.removeClass('active');
						$( $layers[ count ] ).addClass('active');
			        }, 50);

				});
			}
		},

		// Bx SLIDER
        {
            type : '$.fn',
            handle : 'bxSlider',
            src : 'vendor/jquery.bxslider.min.js',
            selector : '[data-plugin="bxslider"]',
            defaults : {
            	auto: true,
            	autoStart: true,
            	speed: 1E3,
            	slideWidth: 1200,
            	oneToOneTouch: !1,
            	onSliderLoad: function () {
            		$(".bx-prev").hover(function () {
			            $(".bxslider").stop(true).animate({
			                marginLeft: "70px"
			            }, 1E3)
			        }, function () {
			            $(".bxslider").stop(true).animate({
			                marginLeft: 0
			            }, 1E3)
			        });

			        $(".bx-next").hover(function () {
		                $(".bxslider").stop(true).animate({
		                    marginLeft: "-70px"
		                }, 1E3)
		            },
		            function () {
		                $(".bxslider").stop(true).animate({
		                    marginLeft: 0
		                }, 1E3)
		            });

            	}
            }
        }



	];

    function findTarget($elem, override) {
        var target = override && $elem.data(override) !== undefined ? $elem.data(override) : $elem.data('target');

    	switch (true) {
		    case target === 'next':
			    return $elem.next();
			    break;

		    case target === 'prev':
			    return $elem.prev();
			    break;

		    case target === 'parent':
			    return $elem.parent();
			    break;

			case target.indexOf('parents') !== -1:
				var parentTarget = target.split(" ")[1];

				return $elem.parents(parentTarget);
				break;

			case target.indexOf('child') !== -1:
				var childTarget = target.split(" ")[1];

				return $elem.find(childTarget);
				break;

		    case target === 'this':
			    return $elem;
			    break;

		    default:
			    return $(target);
			    break;
	    }
    }

	// Kick off initr.
	// Cache the reference to `initr` on our `app` global namespace.
	app.initr = initr( rootPath, deps );

})( jQuery, window.app || (window.app = {}), window );
