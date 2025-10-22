var lnStickyNavigation;

$(document).ready(function()
{
	applyHeader();
	applyNavigation();
	applyMailTo();
	applyResize();
	checkHash();
	checkBrowser();
	applyExpandableExperiences();
	applyJumbotronCycler();
});

/* HEADER FUNCTIONS */

function applyHeader()
{
	$('.jumbotron').css({ height: ($(window).height()) +'px' });
	
	lazyLoad($('.jumbotron'));
}	

function lazyLoad(poContainer)
{
	var lstrSource   = poContainer.attr('data-src');
	var lstrPosition = poContainer.attr('data-position');

	$('<img>').attr('src', lstrSource).load(function()
	{
		poContainer.css('background-image', 'url("'+ lstrSource +'")');
		poContainer.css('background-position', lstrPosition);
		poContainer.css('-ms-filter', '"progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + lstrSource + '\', sizingMethod=\'scale\')"');
		poContainer.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + lstrSource + '\', sizingMethod=\'scale\'');
	});
}

/* NAVIGATION FUNCTIONS */

function applyNavigation()
{
	applyClickEvent();
	applyNavigationFixForPhone();
	applyScrollSpy();
	applyStickyNavigation();
}

function applyClickEvent()
{
	$('a[href*=#]').on('click', function(e)
	{
		e.preventDefault();
		
		if( $( $.attr(this, 'href') ).length > 0 )
		{
			$('html, body').animate(
			{
				scrollTop: $( $.attr(this, 'href') ).offset().top
			}, 400);
		}
		return false;
	});
}

function applyNavigationFixForPhone()
{
	$('.navbar li a').click(function(event) 
	{
		$('.navbar-collapse').removeClass('in').addClass('collapse');
	});
}

function applyScrollSpy()
{
	$('#navbar-example').on('activate.bs.scrollspy', function() 
	{
		window.location.hash = $('.nav .active a').attr('href').replace('#', '#/');
	});
}

function applyStickyNavigation()
{
	lnStickyNavigation = $('.scroll-down').offset().top + 20;
	
	$(window).on('scroll', function() 
	{  
		stickyNavigation();  
	});  
	
	stickyNavigation();
}

function stickyNavigation()
{         
	if($(window).scrollTop() > lnStickyNavigation) 
	{   
		$('body').addClass('fixed');  
	} 
	else 
	{  
		$('body').removeClass('fixed');   
	}  
}

/* MAILTO FUNCTION */

function applyMailTo()
{
	$('a[data-email]').on('click', function(e)
	{
		e.preventDefault();

		var lstrEmail = $(this).attr('data-email');

		// Reverse the obfuscated email
		lstrEmail = lstrEmail.split('').reverse().join('');

		// Navigate to mailto link
		window.location.href = 'mailto:' + lstrEmail;
	});
}

/* RESIZE FUNCTION */

function applyResize()
{
	$(window).on('resize', function() 
	{  
		lnStickyNavigation = $('.scroll-down').offset().top + 20;
	
		$('.jumbotron').css({ height: ($(window).height()) +'px' });
	}); 
}

/* HASH FUNCTION */

function checkHash()
{
	lstrHash = window.location.hash.replace('#/', '#');
	
	if($('a[href='+ lstrHash +']').length > 0)
	{
		$('a[href='+ lstrHash +']').trigger('click');
	}
}

/* IE7- FALLBACK FUNCTIONS */

function checkBrowser()
{
	var loBrowserVersion = getBrowserAndVersion();
	
	if(loBrowserVersion.browser == 'Explorer' && loBrowserVersion.version < 8)
	{ 
		$('#upgrade-dialog').modal({
			backdrop: 'static',
			keyboard: false
		});
	}
}

function getBrowserAndVersion() 
{
	var laBrowserData = [{
		string: 		navigator.userAgent,
		subString: 		'MSIE',
		identity: 		'Explorer',
		versionSearch: 	'MSIE'
	}];
	
	return {
		browser: searchString(laBrowserData) || 'Modern Browser',
		version: searchVersion(navigator.userAgent) || searchVersion(navigator.appVersion) || '0.0'
	};
}

function searchString(paData) 
{
	for(var i = 0; i < paData.length; i++)	
	{
		var lstrDataString 	= paData[i].string;
		var lstrDataProp 	= paData[i].prop;
		
		this.versionSearchString = paData[i].versionSearch || paData[i].identity;
		
		if(lstrDataString) 
		{
			if(lstrDataString.indexOf(paData[i].subString) != -1)
			{
				return paData[i].identity;
			}
		}
		else if(lstrDataProp)
		{
			return paData[i].identity;
		}
	}
}
	
function searchVersion(pstrDataString)
{
	var lnIndex = pstrDataString.indexOf(this.versionSearchString);

	if(lnIndex == -1)
	{
		return;
	}

	return parseFloat(pstrDataString.substring(lnIndex + this.versionSearchString.length + 1));
}

/* EXPANDABLE EXPERIENCES FUNCTION */

function applyExpandableExperiences()
{
	// Only apply on mobile (viewport width <= 767px)
	function checkAndApplyExpandable()
	{
		if($(window).width() <= 767)
		{
			// Add expandable class to all experience items
			$('#experiences .experience').addClass('expandable');

			// Remove any existing click handlers to prevent duplicates
			$('#experiences .experience').off('click.expandable');

			// Add click handler
			$('#experiences .experience').on('click.expandable', function(e)
			{
				// Prevent triggering when clicking on links
				if($(e.target).is('a') || $(e.target).closest('a').length > 0)
				{
					return;
				}

				$(this).toggleClass('expanded');
			});
		}
		else
		{
			// Remove expandable functionality on desktop
			$('#experiences .experience').removeClass('expandable expanded');
			$('#experiences .experience').off('click.expandable');
		}
	}

	// Apply on load
	checkAndApplyExpandable();

	// Re-apply on window resize
	$(window).on('resize', function()
	{
		checkAndApplyExpandable();
	});
}

/* JUMBOTRON GIF CYCLER FUNCTION */

function applyJumbotronCycler()
{
	// Array of available background GIFs
	var backgrounds = [
		'view/images/awesome_animation.gif',
		'view/images/boxes_animation.gif',
		'view/images/circle_animation.gif',
		'view/images/endless_animation.gif',
		'view/images/sphere_animation.gif'
	];

	// Get current index from sessionStorage or default to 1 (boxes - current default)
	var currentIndex = parseInt(sessionStorage.getItem('jumbotronBgIndex') || '1');

	// Ensure index is valid
	if(currentIndex < 0 || currentIndex >= backgrounds.length)
	{
		currentIndex = 1;
	}

	// Add click handler to jumbotron
	$('.jumbotron').on('click', function(e)
	{
		// Don't trigger if clicking the scroll-down arrow
		if($(e.target).closest('.scroll-down').length > 0)
		{
			return;
		}

		// Increment index (cycle through)
		currentIndex = (currentIndex + 1) % backgrounds.length;

		// Save to sessionStorage
		sessionStorage.setItem('jumbotronBgIndex', currentIndex);

		// Get new background
		var newBackground = backgrounds[currentIndex];

		// Preload the image
		var img = new Image();
		img.src = newBackground;

		// Add fade effect
		var jumbotron = $(this);
		jumbotron.addClass('bg-transitioning');

		// Once loaded, apply with smooth transition
		img.onload = function()
		{
			setTimeout(function()
			{
				jumbotron.css('background-image', 'url("'+ newBackground +'")');

				setTimeout(function()
				{
					jumbotron.removeClass('bg-transitioning');
				}, 300);
			}, 150);
		};
	});

	// Add cursor pointer to indicate it's clickable
	$('.jumbotron').css('cursor', 'pointer');
}