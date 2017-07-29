module.exports = () => ({
	"plugins": {
		"postcss-discard-comments" : {
			"removeAll" : true
		},
		"postcss-sassy-mixins"     : {},
		"postcss-normalize"        : {},
		"postcss-easing-gradient"  : {},
		"postcss-media-minmax"     : {},
		"postcss-magic-animations" : {},
		"postcss-easings"          : {},
		"postcss-responsive-type"  : {},
		"postcss-calc"             : {},
		"postcss-csso"             : {},
		"postcss-at-warn"          : {
			"silent" : true
		},
		"postcss-reporter"         : {
			"clearReportedMesages" : true
		},
	}
});
