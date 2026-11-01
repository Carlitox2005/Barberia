-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-09-2026 a las 16:09:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `arias_barber_studio`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `barberos`
--

CREATE TABLE `barberos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `esta_activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `barberos`
--

INSERT INTO `barberos` (`id`, `nombre`, `telefono`, `cedula`, `direccion`, `imagen_url`, `fecha_registro`, `esta_activo`) VALUES
(1, 'luis trejo', '0412-1111111', 'V-30148878', 'tesssssss', NULL, '2026-07-20 01:26:59', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_barbero` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL,
  `estado` enum('activa','completada','cancelada','no_asistio') DEFAULT 'activa',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `id_cliente`, `id_barbero`, `fecha_hora`, `estado`, `fecha_creacion`) VALUES
(1, 2, 1, '2026-07-21 14:30:00', 'completada', '2026-07-20 01:28:56'),
(2, 2, 1, '2026-07-28 15:05:00', 'completada', '2026-07-20 04:05:32'),
(3, 2, 1, '2026-07-22 15:16:00', 'completada', '2026-07-20 04:16:48'),
(4, 2, 1, '2026-07-20 15:18:00', 'completada', '2026-07-20 04:18:37'),
(5, 2, 1, '2026-07-20 10:30:00', 'completada', '2026-07-20 04:28:13'),
(6, 2, 1, '2026-07-28 17:34:00', 'completada', '2026-07-27 02:31:37'),
(7, 2, 1, '2026-07-28 10:00:00', 'completada', '2026-07-27 03:00:30'),
(8, 2, 1, '2026-07-31 15:15:00', 'completada', '2026-07-26 04:15:48'),
(9, 2, 1, '2026-07-27 17:15:00', 'completada', '2026-07-27 04:20:31'),
(10, 2, 1, '2026-07-27 00:50:00', 'completada', '2026-07-27 04:21:00'),
(11, 2, 1, '2026-08-03 09:34:00', 'completada', '2026-08-02 23:34:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `puntos_fidelidad` int(11) DEFAULT 0,
  `imagen_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `id_usuario`, `nombre`, `telefono`, `puntos_fidelidad`, `imagen_url`) VALUES
(1, 2, 'luis trejo', '0424-4972702', 0, NULL),
(2, 3, 'carlos trejoooo', '0416-0442653', 68, '/assets/img/1790773786546-Captura de pantalla_2-8-2026_195620_127.0.0.1.jpeg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL DEFAULT 1,
  `nombre_barberia` varchar(100) DEFAULT NULL,
  `mensaje_bienvenida` text DEFAULT NULL,
  `tiempo_tolerancia_cita` int(11) DEFAULT 15,
  `tema` varchar(20) DEFAULT 'claro',
  `logo_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `nombre_barberia`, `mensaje_bienvenida`, `tiempo_tolerancia_cita`, `tema`, `logo_url`) VALUES
(1, 'Arias Barber Studio', 'Estilismo y Atencion de Alta Calidad\r\n', 20, 'claro', '/assets/img/logo-1785709373766.jpeg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_citas`
--

CREATE TABLE `detalle_citas` (
  `id` int(11) NOT NULL,
  `id_cita` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `precio_historico` decimal(10,2) NOT NULL,
  `puntos_historicos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_citas`
--

INSERT INTO `detalle_citas` (`id`, `id_cita`, `id_servicio`, `precio_historico`, `puntos_historicos`) VALUES
(1, 1, 2, 6.00, 5),
(2, 2, 3, 8.00, 7),
(3, 3, 4, 10.00, 10),
(4, 4, 2, 6.00, 5),
(5, 5, 4, 10.00, 10),
(6, 6, 2, 6.00, 5),
(7, 7, 2, 6.00, 5),
(8, 8, 2, 6.00, 5),
(9, 9, 3, 8.00, 7),
(10, 10, 2, 6.00, 5),
(11, 11, 2, 6.00, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_canjes`
--

CREATE TABLE `historial_canjes` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_recompensa` int(11) NOT NULL,
  `estado` enum('disponible','utilizado','vencido') DEFAULT 'disponible',
  `fecha_canje` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_uso` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_canjes`
--

INSERT INTO `historial_canjes` (`id`, `id_cliente`, `id_recompensa`, `estado`, `fecha_canje`, `fecha_uso`) VALUES
(1, 2, 1, 'disponible', '2026-07-20 03:49:00', NULL),
(2, 2, 1, 'disponible', '2026-07-27 02:30:11', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios_barberos`
--

CREATE TABLE `horarios_barberos` (
  `id` int(11) NOT NULL,
  `id_barbero` int(11) NOT NULL,
  `dia_semana` varchar(20) NOT NULL,
  `hora_apertura` time NOT NULL,
  `hora_cierre` time NOT NULL,
  `esta_activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios_barberos`
--

INSERT INTO `horarios_barberos` (`id`, `id_barbero`, `dia_semana`, `hora_apertura`, `hora_cierre`, `esta_activo`) VALUES
(5, 1, 'Lunes', '08:00:00', '18:00:00', 1),
(7, 1, 'Miércoles', '08:00:00', '18:00:00', 1),
(8, 1, 'Viernes', '08:00:00', '18:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_puntos`
--

CREATE TABLE `movimientos_puntos` (
  `id` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `tipo` enum('acumulacion','canje','ajuste_admin') NOT NULL,
  `cantidad` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_puntos`
--

INSERT INTO `movimientos_puntos` (`id`, `id_cliente`, `tipo`, `cantidad`, `descripcion`, `fecha`) VALUES
(1, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-07-20 01:32:49'),
(2, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-07-20 01:33:48'),
(3, 2, 'canje', -50, 'Canje de recompensa', '2026-07-20 03:49:00'),
(4, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-07-20 04:04:39'),
(5, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-07-20 04:04:47'),
(6, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-07-20 04:04:51'),
(7, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-07-20 04:05:37'),
(8, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-07-20 04:14:46'),
(9, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-07-20 04:14:49'),
(10, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-07-20 04:14:53'),
(11, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-07-20 04:15:00'),
(12, 2, 'acumulacion', 10, 'Puntos ganados por servicio completado', '2026-07-20 04:17:06'),
(13, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-07-20 04:18:47'),
(14, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-07-20 04:21:29'),
(15, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-07-20 04:21:32'),
(16, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-07-20 04:22:28'),
(17, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-07-20 04:22:33'),
(18, 2, 'acumulacion', 10, 'Puntos ganados por servicio completado', '2026-07-20 04:28:40'),
(19, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-07-27 01:13:29'),
(20, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-07-27 01:13:37'),
(21, 2, 'canje', -50, 'Canje de recompensa', '2026-07-27 02:30:11'),
(22, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:08:45'),
(23, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:08:50'),
(24, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:09:01'),
(25, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:09:22'),
(26, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:11:11'),
(27, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-08-02 23:11:20'),
(28, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:12:28'),
(29, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:41'),
(30, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:44'),
(31, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:46'),
(32, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:49'),
(33, 2, 'ajuste_admin', -7, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:52'),
(34, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:54'),
(35, 2, 'ajuste_admin', -5, 'Reversión de puntos por modificación de estado', '2026-08-02 23:13:56'),
(36, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-08-02 23:14:00'),
(37, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-08-02 23:14:02'),
(38, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-08-02 23:14:04'),
(39, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-08-02 23:14:06'),
(40, 2, 'acumulacion', 7, 'Puntos ganados por servicio completado', '2026-08-02 23:14:09'),
(41, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-08-02 23:14:12'),
(42, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-08-02 23:14:14'),
(43, 2, 'acumulacion', 5, 'Puntos ganados por servicio completado', '2026-08-02 23:35:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recompensas`
--

CREATE TABLE `recompensas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `puntos_requeridos` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recompensas`
--

INSERT INTO `recompensas` (`id`, `nombre`, `puntos_requeridos`, `descripcion`, `imagen_url`, `estado`, `fecha_creacion`) VALUES
(1, 'shampoo', 50, 'adasadsada', '/assets/img/1784519084865-2026-03-03 (4).png', 'activo', '2026-07-20 03:44:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'administrador'),
(2, 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `duracion_minutos` int(11) NOT NULL,
  `puntos_otorgados` int(11) DEFAULT 0,
  `imagen_url` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `esta_activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `nombre`, `precio`, `duracion_minutos`, `puntos_otorgados`, `imagen_url`, `fecha_creacion`, `esta_activo`) VALUES
(2, 'Corte clásico', 6.00, 60, 5, '/assets/img/1784510573375-1775418101571-WhatsApp Image 2026-04-05 at 3.36.49 PM.jpeg', '2026-07-20 01:22:53', 1),
(3, 'Corte clásico + Barba', 8.00, 70, 7, '/assets/img/1784510749643-1775418610939-WhatsApp Image 2026-04-05 at 3.36.53 PM.jpeg', '2026-07-20 01:25:49', 1),
(4, 'Corte clásico + Barba + Tratamiento facial', 10.00, 90, 10, '/assets/img/1784510775179-1775418726125-WhatsApp Image 2026-04-05 at 3.37.10 PM (2).jpeg', '2026-07-20 01:26:15', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tasa_cambio`
--

CREATE TABLE `tasa_cambio` (
  `moneda` varchar(10) NOT NULL,
  `tasa` decimal(10,2) NOT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tasa_cambio`
--

INSERT INTO `tasa_cambio` (`moneda`, `tasa`, `fecha_actualizacion`) VALUES
('VES', 859.06, '2026-09-30 12:59:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL DEFAULT 2,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password_hash`, `id_rol`, `reset_token`, `reset_token_expires`, `fecha_registro`) VALUES
(1, 'admin@ariasbarberstudio.com', '$2b$10$b4Au9fRG80K7ev2c8NanUuYP1472.eOLlYBCAiA8BGf1yQGty2KKy', 1, NULL, NULL, '2026-06-15 02:01:19'),
(2, 'eduardotrejo.lt@gmail.com', '$2b$10$LGa1.QfVSndGVOiOv1lFneyrV.wMqq/7bI29OboiHGSt5FYtLfA7K', 2, NULL, NULL, '2026-06-15 02:01:49'),
(3, 'carlostrejo@gmail.com', '$2b$10$S.m/Z/Tr92FjkgcdAnMLuuSZSYXVnELNhT5mb6f2jc6iUYA8j4ZCW', 2, '384ab39544b2fedea6eec6a4485c30b039b23dbe', '2026-07-19 22:17:07', '2026-07-20 01:16:37');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `barberos`
--
ALTER TABLE `barberos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_cliente`),
  ADD KEY `id_barbero` (`id_barbero`),
  ADD KEY `idx_citas_fecha` (`fecha_hora`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_citas`
--
ALTER TABLE `detalle_citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_cita` (`id_cita`),
  ADD KEY `id_servicio` (`id_servicio`);

--
-- Indices de la tabla `historial_canjes`
--
ALTER TABLE `historial_canjes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_cliente`),
  ADD KEY `id_recompensa` (`id_recompensa`);

--
-- Indices de la tabla `horarios_barberos`
--
ALTER TABLE `horarios_barberos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_barbero` (`id_barbero`);

--
-- Indices de la tabla `movimientos_puntos`
--
ALTER TABLE `movimientos_puntos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_cliente`);

--
-- Indices de la tabla `recompensas`
--
ALTER TABLE `recompensas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tasa_cambio`
--
ALTER TABLE `tasa_cambio`
  ADD PRIMARY KEY (`moneda`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuario_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `barberos`
--
ALTER TABLE `barberos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `detalle_citas`
--
ALTER TABLE `detalle_citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `historial_canjes`
--
ALTER TABLE `historial_canjes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `horarios_barberos`
--
ALTER TABLE `horarios_barberos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `movimientos_puntos`
--
ALTER TABLE `movimientos_puntos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `recompensas`
--
ALTER TABLE `recompensas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_barbero`) REFERENCES `barberos` (`id`),
  ADD CONSTRAINT `fk_citas_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_clientes_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `detalle_citas`
--
ALTER TABLE `detalle_citas`
  ADD CONSTRAINT `detalle_citas_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_citas_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`);

--
-- Filtros para la tabla `historial_canjes`
--
ALTER TABLE `historial_canjes`
  ADD CONSTRAINT `fk_canjes_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_canjes_ibfk_2` FOREIGN KEY (`id_recompensa`) REFERENCES `recompensas` (`id`);

--
-- Filtros para la tabla `horarios_barberos`
--
ALTER TABLE `horarios_barberos`
  ADD CONSTRAINT `horarios_barberos_ibfk_1` FOREIGN KEY (`id_barbero`) REFERENCES `barberos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `movimientos_puntos`
--
ALTER TABLE `movimientos_puntos`
  ADD CONSTRAINT `fk_mov_puntos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
