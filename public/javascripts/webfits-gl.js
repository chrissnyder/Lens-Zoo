// Generated by CoffeeScript 1.4.0
(function() {
  var Api, BaseApi, Shaders, WebFITS, version,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (this.astro == null) {
    this.astro = {};
  }

  WebFITS = {};

  WebFITS.version = '0.1.6';

  this.astro.WebFITS = WebFITS;

  BaseApi = (function() {

    function BaseApi(el, dimension) {
      this.el = el;
      this.wheelHandler = __bind(this.wheelHandler, this);

      this.width = this.height = dimension;
      this.canvas = document.createElement('canvas');
      this.canvas.setAttribute('width', this.width);
      this.canvas.setAttribute('height', this.height);
      this.el.appendChild(this.canvas);
      this.nImages = 0;
      this.lookup = {};
      if (!this.getContext()) {
        return null;
      }
      this.xOffset = -this.width / 2;
      this.yOffset = -this.height / 2;
      this.xOldOffset = this.xOffset;
      this.yOldOffset = this.yOffset;
      this.drag = false;
      this.zoom = 2 / this.width;
      this.minZoom = this.zoom;
      this.maxZoom = 12 * this.zoom;
      this.zoomX = this.zoom;
      this.zoomY = this.zoom;
    }

    BaseApi.prototype.setupControls = function(callback, opts) {
      var _onmousemove,
        _this = this;
      if (callback == null) {
        callback = null;
      }
      if (opts == null) {
        opts = null;
      }
      this.canvas.onmousedown = function(e) {
        _this.drag = true;
        _this.xOldOffset = _this.xOffset;
        _this.yOldOffset = _this.yOffset;
        _this.xMouseDown = e.clientX;
        return _this.yMouseDown = e.clientY;
      };
      this.canvas.onmouseup = function(e) {
        var xDelta, yDelta;
        _this.drag = false;
        if (_this.xMouseDown == null) {
          return null;
        }
        xDelta = e.clientX - _this.xMouseDown;
        yDelta = e.clientY - _this.yMouseDown;
        _this.xOffset = _this.xOldOffset + (xDelta / _this.width / _this.zoom * 2.0);
        _this.yOffset = _this.yOldOffset - (yDelta / _this.height / _this.zoom * 2.0);
        return _this.draw();
      };
      _onmousemove = function(e) {
        var xDelta, yDelta;
        if (!_this.drag) {
          return;
        }
        xDelta = e.clientX - _this.xMouseDown;
        yDelta = e.clientY - _this.yMouseDown;
        _this.xOffset = _this.xOldOffset + (xDelta / _this.width / _this.zoom * 2.0);
        _this.yOffset = _this.yOldOffset - (yDelta / _this.height / _this.zoom * 2.0);
        return _this.draw();
      };
      if (callback != null) {
        this.canvas.onmousemove = function(e) {
          var x, xDelta, y, yDelta;
          xDelta = -1 * (_this.width / 2 - e.offsetX) / _this.width / _this.zoom * 2.0;
          yDelta = (_this.height / 2 - e.offsetY) / _this.height / _this.zoom * 2.0;
          x = ((-1 * (_this.xOffset + 0.5)) + xDelta) + 1.5 << 0;
          y = ((-1 * (_this.yOffset + 0.5)) + yDelta) + 1.5 << 0;
          callback.call(_this, x, y, opts);
          return _onmousemove(e);
        };
      } else {
        this.canvas.onmousemove = function(e) {
          return _onmousemove(e);
        };
      }
      this.canvas.onmouseout = function(e) {
        return _this.drag = false;
      };
      this.canvas.onmouseover = function(e) {
        return _this.drag = false;
      };
      this.canvas.addEventListener('mousewheel', this.wheelHandler, false);
      return this.canvas.addEventListener('DOMMouseScroll', this.wheelHandler, false);
    };

    BaseApi.prototype.wheelHandler = function(e) {
      var factor;
      e.preventDefault();
      factor = e.shiftKey ? 1.01 : 1.1;
      this.zoom *= (e.detail || e.wheelDelta) < 0 ? factor : 1 / factor;
      this.zoom = this.zoom > this.maxZoom ? this.maxZoom : this.zoom;
      return this.zoom = this.zoom < this.minZoom ? this.minZoom : this.zoom;
    };

    return BaseApi;

  })();

  this.astro.WebFITS.BaseApi = BaseApi;

  Shaders = {
    vertex: ["attribute vec2 a_position;", "attribute vec2 a_textureCoord;", "uniform vec2 u_offset;", "uniform float u_scale;", "varying vec2 v_textureCoord;", "void main() {", "vec2 position = a_position + u_offset;", "position = position * u_scale;", "gl_Position = vec4(position, 0.0, 1.0);", "v_textureCoord = a_textureCoord;", "}"].join("\n"),
    linear: ["precision mediump float;", "uniform sampler2D u_tex;", "uniform vec2 u_extent;", "varying vec2 v_textureCoord;", "void main() {", "vec4 pixel_v = texture2D(u_tex, v_textureCoord);", "float min = u_extent[0];", "float max = u_extent[1];", "float pixel = (pixel_v[0] - min) / (max - min);", "gl_FragColor = vec4(pixel, pixel, pixel, 1.0);", "}"].join("\n"),
    logarithm: ["precision mediump float;", "uniform sampler2D u_tex;", "uniform vec2 u_extent;", "varying vec2 v_textureCoord;", "float logarithm(float value) {", "return log(value / 0.05 + 1.0) / log(1.0 / 0.05 + 1.0);", "}", "void main() {", "vec4 pixel_v = texture2D(u_tex, v_textureCoord);", "float min = u_extent[0];", "float max = u_extent[1];", "max = max - min;", "float minScaled = logarithm(0.0);", "max = logarithm(max);", "float pixel = pixel_v[0] - min;", "pixel = logarithm(pixel);", "pixel = (pixel - minScaled) / (max - minScaled);", "gl_FragColor = vec4(pixel, pixel, pixel, 1.0);", "}"].join("\n"),
    sqrt: ["precision mediump float;", "uniform sampler2D u_tex;", "uniform vec2 u_extent;", "varying vec2 v_textureCoord;", "void main() {", "vec4 pixel_v = texture2D(u_tex, v_textureCoord);", "float min = u_extent[0];", "float max = u_extent[1] - min;", "float pixel = pixel_v[0] - min;", "pixel = sqrt(pixel_v[0] / max);", "gl_FragColor = vec4(pixel, pixel, pixel, 1.0);", "}"].join("\n"),
    arcsinh: ["precision mediump float;", "uniform sampler2D u_tex;", "uniform vec2 u_extent;", "varying vec2 v_textureCoord;", "float arcsinh(float value) {", "return log(value + sqrt(1.0 + value * value));", "}", "float scaledArcsinh(float value) {", "return arcsinh(value / -0.033) / arcsinh(1.0 / -0.033);", "}", "void main() {", "vec4 pixel_v = texture2D(u_tex, v_textureCoord);", "float min = scaledArcsinh(u_extent[0]);", "float max = scaledArcsinh(u_extent[1]);", "float value = scaledArcsinh(pixel_v[0]);", "float pixel = (value - min) / (max - min);", "gl_FragColor = vec4(pixel, pixel, pixel, 1.0);", "}"].join("\n"),
    power: ["precision mediump float;", "uniform sampler2D u_tex;", "uniform vec2 u_extent;", "varying vec2 v_textureCoord;", "void main() {", "vec4 pixel_v = texture2D(u_tex, v_textureCoord);", "float min = u_extent[0];", "float max = u_extent[1] - min;", "float pixel = pixel_v[0] - min;", "pixel = pow(pixel / max, 2.0);", "gl_FragColor = vec4(pixel, pixel, pixel, 1.0);", "}"].join("\n"),
    color: ["precision mediump float;", "uniform sampler2D u_tex0;", "uniform sampler2D u_tex1;", "uniform sampler2D u_tex2;", "uniform float u_r_scale;", "uniform float u_g_scale;", "uniform float u_b_scale;", "uniform float u_r_calibration;", "uniform float u_g_calibration;", "uniform float u_b_calibration;", "uniform float u_alpha;", "uniform float u_Q;", "varying vec2 v_textureCoord;", "float arcsinh(float value) {", "return log(value + sqrt(1.0 + value * value));", "}", "void main() {", "vec4 pixel_v_r = texture2D(u_tex0, v_textureCoord);", "vec4 pixel_v_g = texture2D(u_tex1, v_textureCoord);", "vec4 pixel_v_b = texture2D(u_tex2, v_textureCoord);", "float r = (pixel_v_r[0]) * u_r_calibration * u_r_scale;", "float g = (pixel_v_g[0]) * u_g_calibration * u_g_scale;", "float b = (pixel_v_b[0]) * u_b_calibration * u_b_scale;", "float I = r + g + b + 1e-10;", "float factor = arcsinh(u_alpha * u_Q * I) / (u_Q * I);", "float R = clamp(r * factor, 0.0, 1.0);", "float G = clamp(g * factor, 0.0, 1.0);", "float B = clamp(b * factor, 0.0, 1.0);", "gl_FragColor = vec4(R, G, B, 1.0);", "}"].join("\n")
  };

  this.astro.WebFITS.Shaders = Shaders;

  BaseApi = this.astro.WebFITS.BaseApi;

  Shaders = this.astro.WebFITS.Shaders;

  Api = (function(_super) {

    __extends(Api, _super);

    Api.prototype.fShaders = ['linear', 'logarithm', 'sqrt', 'arcsinh', 'power', 'color'];

    function Api() {
      this._reset();
      Api.__super__.constructor.apply(this, arguments);
    }

    Api.prototype._reset = function() {
      this.programs = {};
      this.textures = {};
      this.buffers = [];
      return this.shaders = [];
    };

    Api.prototype._getExtension = function() {
      return this.ctx.getExtension('OES_texture_float');
    };

    Api.prototype._loadShader = function(source, type) {
      var compiled, ctx, lastError, shader;
      ctx = this.ctx;
      shader = ctx.createShader(type);
      ctx.shaderSource(shader, source);
      ctx.compileShader(shader);
      compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
      if (!compiled) {
        lastError = ctx.getShaderInfoLog(shader);
        throw "Error compiling shader " + shader + ": " + lastError;
        ctx.deleteShader(shader);
        return null;
      }
      this.shaders.push(shader);
      return shader;
    };

    Api.prototype._createProgram = function(vshader, fshader) {
      var ctx, linked, program;
      ctx = this.ctx;
      program = ctx.createProgram();
      ctx.attachShader(program, vshader);
      ctx.attachShader(program, fshader);
      ctx.linkProgram(program);
      linked = ctx.getProgramParameter(program, ctx.LINK_STATUS);
      if (!linked) {
        throw "Error in program linking: " + (ctx.getProgramInfoLog(program));
        ctx.deleteProgram(program);
        return null;
      }
      return program;
    };

    Api.prototype._setRectangle = function(ctx, width, height) {
      var x1, x2, y1, y2, _ref, _ref1;
      _ref = [0, 0 + width], x1 = _ref[0], x2 = _ref[1];
      _ref1 = [0, 0 + height], y1 = _ref1[0], y2 = _ref1[1];
      return ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), ctx.STATIC_DRAW);
    };

    Api.prototype._updateUniforms = function(program) {
      var offsetLocation, scaleLocation;
      offsetLocation = this.ctx.getUniformLocation(program, 'u_offset');
      scaleLocation = this.ctx.getUniformLocation(program, 'u_scale');
      this.ctx.uniform2f(offsetLocation, this.xOffset, this.yOffset);
      return this.ctx.uniform1f(scaleLocation, this.zoom);
    };

    Api.prototype.getContext = function() {
      var buffer, ctx, ext, fragShader, height, index, key, name, offsetLocation, positionLocation, program, scaleLocation, texCoordBuffer, texCoordLocation, vertexShader, width, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      _ref = ['webgl', 'experimental-webgl'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        try {
          ctx = this.canvas.getContext(name);
          width = this.canvas.width;
          height = this.canvas.height;
          ctx.viewport(0, 0, width, height);
        } catch (e) {

        }
        if (ctx) {
          break;
        }
      }
      if (!ctx) {
        return null;
      }
      this.ctx = ctx;
      ext = this._getExtension();
      if (!ext) {
        return null;
      }
      vertexShader = this._loadShader(Shaders.vertex, ctx.VERTEX_SHADER);
      if (!vertexShader) {
        return null;
      }
      _ref1 = this.fShaders;
      for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
        key = _ref1[index];
        fragShader = this._loadShader(Shaders[key], ctx.FRAGMENT_SHADER);
        if (!fragShader) {
          return null;
        }
        this.programs[key] = this._createProgram(vertexShader, fragShader);
        if (!this.programs[key]) {
          return null;
        }
      }
      _ref2 = this.programs;
      for (key in _ref2) {
        program = _ref2[key];
        ctx.useProgram(program);
        positionLocation = ctx.getAttribLocation(program, 'a_position');
        texCoordLocation = ctx.getAttribLocation(program, 'a_textureCoord');
        offsetLocation = ctx.getUniformLocation(program, 'u_offset');
        scaleLocation = ctx.getUniformLocation(program, 'u_scale');
        ctx.uniform2f(offsetLocation, -width / 2, -height / 2);
        ctx.uniform1f(scaleLocation, 2 / width);
      }
      this.currentProgram = this.programs.linear;
      texCoordBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, texCoordBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]), ctx.STATIC_DRAW);
      ctx.enableVertexAttribArray(texCoordLocation);
      ctx.vertexAttribPointer(texCoordLocation, 2, ctx.FLOAT, false, 0, 0);
      buffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
      ctx.enableVertexAttribArray(positionLocation);
      ctx.vertexAttribPointer(positionLocation, 2, ctx.FLOAT, false, 0, 0);
      this.buffers.push(texCoordBuffer);
      this.buffers.push(buffer);
      return ctx;
    };

    Api.prototype.loadImage = function(identifier, arr, width, height) {
      var ctx, index, texture;
      ctx = this.ctx;
      this._setRectangle(ctx, width, height);
      index = this.nImages;
      this.lookup[identifier] = this.nImages;
      ctx.activeTexture(ctx.TEXTURE0 + this.nImages);
      texture = ctx.createTexture();
      ctx.bindTexture(ctx.TEXTURE_2D, texture);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
      ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.LUMINANCE, width, height, 0, ctx.LUMINANCE, ctx.FLOAT, new Float32Array(arr));
      if (this.currentImage == null) {
        this.currentImage = identifier;
      }
      this.textures[identifier] = texture;
      return this.nImages += 1;
    };

    Api.prototype.setImage = function(identifier) {
      var index, location;
      index = this.lookup[identifier];
      this.ctx.activeTexture(this.ctx.TEXTURE0 + index);
      location = this.ctx.getUniformLocation(this.currentProgram, "u_tex");
      this.ctx.uniform1i(location, index);
      return this.currentImage = identifier;
    };

    Api.prototype.setStretch = function(stretch) {
      this.currentProgram = this.programs[stretch];
      this.ctx.useProgram(this.currentProgram);
      this.setImage(this.currentImage);
      return this.draw();
    };

    Api.prototype.setExtent = function(min, max) {
      var ctx, location, program, stretch, _i, _len, _ref;
      ctx = this.ctx;
      _ref = ['linear', 'logarithm', 'sqrt', 'arcsinh', 'power'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stretch = _ref[_i];
        program = this.programs[stretch];
        ctx.useProgram(program);
        location = ctx.getUniformLocation(program, 'u_extent');
        ctx.uniform2f(location, min, max);
      }
      ctx.useProgram(this.currentProgram);
      return ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.setScales = function(r, g, b) {
      var ctx, location, program;
      ctx = this.ctx;
      program = this.programs.color;
      ctx.useProgram(program);
      location = ctx.getUniformLocation(program, "u_r_scale");
      ctx.uniform1f(location, r);
      location = ctx.getUniformLocation(program, "u_g_scale");
      ctx.uniform1f(location, g);
      location = ctx.getUniformLocation(program, "u_b_scale");
      ctx.uniform1f(location, b);
      return ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.setCalibrations = function(r, g, b) {
      var ctx, location;
      ctx = this.ctx;
      ctx.useProgram(this.programs.color);
      location = ctx.getUniformLocation(this.programs.color, 'u_r_calibration');
      ctx.uniform1f(location, r);
      location = ctx.getUniformLocation(this.programs.color, 'u_g_calibration');
      ctx.uniform1f(location, g);
      location = ctx.getUniformLocation(this.programs.color, 'u_b_calibration');
      ctx.uniform1f(location, b);
      return ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.setAlpha = function(value) {
      var ctx, location;
      ctx = this.ctx;
      ctx.useProgram(this.programs.color);
      location = ctx.getUniformLocation(this.programs.color, 'u_alpha');
      ctx.uniform1f(location, value);
      return ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.setQ = function(value) {
      var ctx, location;
      ctx = this.ctx;
      ctx.useProgram(this.programs.color);
      location = ctx.getUniformLocation(this.programs.color, 'u_Q');
      ctx.uniform1f(location, value);
      return ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.draw = function() {
      this._updateUniforms(this.currentProgram);
      return this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.drawColor = function(r, g, b) {
      var ctx, location, program;
      ctx = this.ctx;
      program = this.currentProgram = this.programs.color;
      ctx.useProgram(program);
      location = ctx.getUniformLocation(program, "u_tex0");
      ctx.uniform1i(location, this.lookup[r]);
      location = ctx.getUniformLocation(program, "u_tex1");
      ctx.uniform1i(location, this.lookup[g]);
      location = ctx.getUniformLocation(program, "u_tex2");
      ctx.uniform1i(location, this.lookup[b]);
      return this.draw();
    };

    Api.prototype.wheelHandler = function(e) {
      var location;
      Api.__super__.wheelHandler.apply(this, arguments);
      location = this.ctx.getUniformLocation(this.currentProgram, 'u_scale');
      this.ctx.uniform1f(location, this.zoom);
      return this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 6);
    };

    Api.prototype.teardown = function() {
      var buffer, ctx, key, program, shader, texture, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      ctx = this.ctx;
      _ref = this.textures;
      for (key in _ref) {
        texture = _ref[key];
        ctx.deleteTexture(texture);
      }
      _ref1 = this.buffers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        buffer = _ref1[_i];
        ctx.deleteBuffer(buffer);
      }
      _ref2 = this.shaders;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        shader = _ref2[_j];
        ctx.deleteShader(shader);
      }
      _ref3 = this.programs;
      for (key in _ref3) {
        program = _ref3[key];
        ctx.deleteProgram(program);
      }
      this.el.removeChild(this.canvas);
      this.ctx = void 0;
      return this._reset();
    };

    return Api;

  })(BaseApi);

  version = this.astro.WebFITS.version;

  this.astro.WebFITS = Api;

  this.astro.WebFITS.version = version;

}).call(this);
